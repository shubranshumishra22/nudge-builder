import { createClient } from '@supabase/supabase-js'
import { OrderConfirmationHtml, OwnerNewOrderHtml } from './email-templates'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const WATI_ENDPOINT = process.env.WATI_ENDPOINT
const WATI_API_KEY = process.env.WATI_API_KEY

export async function notifyStoreOwner(orderId: string) {
  try {
    const { data: order } = await supabase
      .from('orders')
      .select('*, stores!inner(*, profiles!inner(*))')
      .eq('id', orderId)
      .single()

    if (!order) return

    const store = (order as any).stores
    const owner = store?.profiles
    const total = (order as any).total
    const customerName = (order as any).customer_name
    const orderNumber = (order as any).order_number

    const whatsappMsg = `🛍️ New order on ${store?.name}!\n\n₹${total} from ${customerName}\nOrder: ${orderNumber || '-'}\n\nView dashboard: https://nudge.store/dashboard/orders`

    if (WATI_ENDPOINT && WATI_API_KEY && store?.whatsapp_number) {
      try {
        await fetch(`${WATI_ENDPOINT}/api/v1/sendTemplateMessage`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${WATI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            whatsappNumber: store.whatsapp_number,
            templateName: 'new_order',
            parameters: [store?.name, `₹${total}`, customerName, orderNumber || '-'],
          }),
        })
      } catch {
        try {
          await fetch(`${WATI_ENDPOINT}/api/v1/sendSessionMessage`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${WATI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              whatsappNumber: store?.whatsapp_number,
              message: whatsappMsg,
            }),
          })
        } catch {}
      }
    }

    if (owner?.email) {
      const resendKey = process.env.RESEND_API_KEY
      if (resendKey) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Nudge Commerce <orders@nudge.store>',
              to: [owner.email],
              subject: `🛍️ New order on ${store?.name} — ₹${total}`,
              html: OwnerNewOrderHtml({ order: order as any, store }),
            }),
          })
        } catch {}
      }
    }
  } catch (err) {
    console.error('notifyStoreOwner error:', err)
  }
}

export async function notifyCustomer(orderId: string) {
  try {
    const { data: order } = await supabase
      .from('orders')
      .select('*, stores(*)')
      .eq('id', orderId)
      .single()

    if (!order) return

    const store = (order as any).stores
    const customerEmail = (order as any).customer_email

    if (!customerEmail) return

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) return

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${store?.name} <orders@nudge.store>`,
          to: [customerEmail],
          subject: `Order confirmed — ${store?.name}`,
          html: OrderConfirmationHtml({ order: order as any, store }),
        }),
      })
    } catch {}
  } catch (err) {
    console.error('notifyCustomer error:', err)
  }
}
