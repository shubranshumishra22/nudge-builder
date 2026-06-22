import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@nudge/db'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const db = createClient(supabaseUrl, supabaseKey)

const RAZORPAY_PLAN_IDS: Record<string, string> = {
  pro: process.env.RAZORPAY_PRO_PLAN_ID || '',
  agency: process.env.RAZORPAY_AGENCY_PLAN_ID || '',
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient({ get(name) { return cookieStore.get(name)?.value }, set() {}, remove() {} })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan } = await request.json()
    if (!plan || !['pro', 'agency'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const planId = RAZORPAY_PLAN_IDS[plan]
    if (!planId) {
      return NextResponse.json({ error: 'Razorpay plan not configured' }, { status: 500 })
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET
    if (!razorpayKeyId || !razorpaySecret) {
      return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 })
    }

    const auth = Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString('base64')

    const res = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        customer_notify: 1,
        total_count: 12,
        notes: {
          user_id: user.id,
          plan,
        },
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data.error?.description || 'Razorpay error' }, { status: 500 })
    }

    return NextResponse.json({
      subscription_id: data.id,
      short_url: data.short_url,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
