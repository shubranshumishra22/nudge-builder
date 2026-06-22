import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const db = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const text = await request.text()
    const sigHeader = request.headers.get('x-razorpay-signature')
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (webhookSecret && sigHeader) {
      const expected = crypto.createHmac('sha256', webhookSecret).update(text).digest('hex')
      if (expected !== sigHeader) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    }

    const payload = JSON.parse(text)
    const event = payload.event
    const entity = payload.payload?.subscription?.entity

    if (!entity) return NextResponse.json({ ok: true })

    const razorpaySubscriptionId = entity.id
    const userId = entity.notes?.user_id
    const plan = entity.notes?.plan as string

    if (!userId || !plan) return NextResponse.json({ ok: true })

    switch (event) {
      case 'subscription.activated': {
        const periodEnd = entity.current_end
          ? new Date(entity.current_end * 1000).toISOString()
          : null

        await db.from('profiles').update({
          plan,
          plan_expires_at: periodEnd,
        }).eq('id', userId)

        const { data: existing } = await db.from('subscriptions').select('id').eq('razorpay_subscription_id', razorpaySubscriptionId).maybeSingle()
        if (!existing) {
          await db.from('subscriptions').insert({
            owner_id: userId,
            plan,
            status: 'active',
            razorpay_subscription_id: razorpaySubscriptionId,
            current_period_start: entity.current_start ? new Date(entity.current_start * 1000).toISOString() : new Date().toISOString(),
            current_period_end: periodEnd,
          })
        } else {
          await db.from('subscriptions').update({ status: 'active' }).eq('id', existing.id)
        }
        break
      }

      case 'subscription.charged': {
        const chargedPeriodEnd = entity.current_end
          ? new Date(entity.current_end * 1000).toISOString()
          : null
        if (chargedPeriodEnd) {
          await db.from('profiles').update({ plan_expires_at: chargedPeriodEnd }).eq('id', userId)
          await db.from('subscriptions').update({ current_period_end: chargedPeriodEnd }).eq('razorpay_subscription_id', razorpaySubscriptionId)
        }
        break
      }

      case 'subscription.cancelled': {
        await db.from('subscriptions').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('razorpay_subscription_id', razorpaySubscriptionId)
        break
      }

      case 'subscription.halted': {
        try {
          const { data: profile } = await db.from('profiles').select('email').eq('id', userId).single()
          if (profile?.email) {
            const resendKey = process.env.RESEND_API_KEY
            if (resendKey) {
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  from: 'Nudge <billing@nudge.store>',
                  to: [profile.email],
                  subject: 'Payment failed — action required',
                  html: `<p>Your subscription payment failed. Please update your payment method to avoid service interruption.</p>`,
                }),
              })
            }
          }
        } catch {}
        break
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Billing webhook error:', err)
    return NextResponse.json({ ok: true })
  }
}
