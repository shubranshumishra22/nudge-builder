export function OrderConfirmationHtml({
  order,
  store,
}: {
  order: { order_number?: string; total: number; delivery_address?: any }
  store: { name: string; slug: string; whatsapp_number?: string }
}) {
  const whatsappUrl = store.whatsapp_number
    ? `https://wa.me/91${store.whatsapp_number.replace(/[^0-9]/g, '')}`
    : null

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background: #f5f5f0; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
  .card { background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  h1 { font-family: 'Instrument Serif', Georgia, serif; font-size: 28px; font-weight: 400; margin: 0 0 8px; }
  .order-num { color: #6b7280; font-size: 14px; margin: 0 0 24px; }
  .checkmark { width: 64px; height: 64px; margin: 0 auto 16px; display: block; }
  .items { border-top: 1px solid #e5e7eb; margin-top: 24px; padding-top: 24px; }
  .item { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
  .total-row { display: flex; justify-content: space-between; font-weight: 600; font-size: 16px; border-top: 1px solid #e5e7eb; margin-top: 16px; padding-top: 16px; }
  .btn { display: inline-block; margin-top: 24px; padding: 12px 24px; background: #4F46E5; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500; }
  .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #9ca3af; }
</style></head><body>
<div class="container">
  <div class="card">
    <svg class="checkmark" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="28" stroke="#22c55e" stroke-width="4"/><path d="M20 32l8 8 16-16" stroke="#22c55e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <h1>Order confirmed!</h1>
    ${order.order_number ? `<p class="order-num">Order #${order.order_number}</p>` : ''}
    <p style="color:#6b7280;font-size:14px">Thank you for your order from <strong>${store.name}</strong>.</p>

    <div class="items">
      <p style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#9ca3af;margin:0 0 12px">Items</p>
      <div class="total-row"><span>Total</span><span>₹${order.total.toLocaleString('en-IN')}</span></div>
    </div>

    ${order.delivery_address ? `<div style="margin-top:24px;padding-top:24px;border-top:1px solid #e5e7eb;font-size:14px;color:#6b7280"><p style="font-weight:600;color:#111;margin:0 0 4px">Delivering to</p>${order.delivery_address.line1}${order.delivery_address.line2 ? `<br>${order.delivery_address.line2}` : ''}<br>${order.delivery_address.city}, ${order.delivery_address.state} — ${order.delivery_address.pincode}</div>` : ''}

    ${whatsappUrl ? `<a href="${whatsappUrl}" class="btn">Track on WhatsApp</a>` : ''}
  </div>
  <div class="footer"><p>Powered by <strong>Nudge</strong></p></div>
</div>
</body></html>`
}

export function OwnerNewOrderHtml({
  order,
  store,
}: {
  order: { order_number?: string; total: number; customer_name: string }
  store: { name: string }
}) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background: #f5f5f0; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
  .card { background: #fff; border-radius: 12px; padding: 32px; }
  h1 { font-family: 'Instrument Serif', Georgia, serif; font-size: 24px; font-weight: 400; margin: 0 0 8px; color: #111; }
  .badge { display: inline-block; background: #fef3c7; color: #92400e; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px; margin-bottom: 16px; }
  .row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
  .label { color: #6b7280; }
  .btn { display: inline-block; margin-top: 24px; padding: 12px 24px; background: #4F46E5; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500; }
</style></head><body>
<div class="container">
  <div class="card">
    <div class="badge">New order</div>
    <h1>${store.name}</h1>
    <p style="color:#6b7280;font-size:14px">You received a new order${order.order_number ? ` (#${order.order_number})` : ''}!</p>
    <div style="margin-top:20px"><div class="row"><span class="label">Customer</span><span>${order.customer_name}</span></div><div class="row"><span class="label">Total</span><span>₹${order.total.toLocaleString('en-IN')}</span></div></div>
    <a href="https://nudge.store/dashboard/orders" class="btn">View in dashboard</a>
  </div>
</div>
</body></html>`
}
