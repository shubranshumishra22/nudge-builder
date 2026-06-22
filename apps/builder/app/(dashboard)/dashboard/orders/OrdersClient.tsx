'use client'

import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'

const tabs = ['All', 'New', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700', shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
}

export default function OrdersClient({ store, orders: initial }: { store: any; orders: any[] }) {
  const [orders, setOrders] = useState(initial)
  const [tab, setTab] = useState('All')
  const [detail, setDetail] = useState<any>(null)
  const [ownerNotes, setOwnerNotes] = useState('')

  const filtered = tab === 'All' ? orders : orders.filter((o) => o.status.toLowerCase() === tab.toLowerCase())

  const handleStatusChange = async (orderId: string, status: string) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o))
    if (detail?.id === orderId) setDetail({ ...detail, status })
    await fetch(`/api/orders/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
  }

  const handleNotesSave = async (orderId: string) => {
    await fetch(`/api/orders/${orderId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ owner_notes: ownerNotes }) })
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold tracking-tight">Orders</h1>

      <div className="mt-4 flex gap-1 rounded-xl bg-[#F4F3F0] p-1 text-xs">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-lg py-2 font-medium transition-colors ${tab === t ? 'bg-white text-[#0F0F0E] shadow-sm' : 'text-muted-foreground hover:text-[#0F0F0E]'}`}>{t}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No orders found.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-[#F4F3F0] text-xs text-muted-foreground">
              <tr><th className="px-4 py-3 font-medium">Order</th><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Items</th><th className="px-4 py-3 font-medium">Total</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium"></th></tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-[#FAFAF8] cursor-pointer" onClick={() => { setDetail(o); setOwnerNotes(o.owner_notes || '') }}>
                  <td className="px-4 py-3 font-mono text-xs">{o.order_number || o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{o.customer_name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{o.order_items?.length || 0}</td>
                  <td className="px-4 py-3 font-medium">₹{o.total.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={(e) => { e.stopPropagation(); handleStatusChange(o.id, e.target.value) }} className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium outline-none ${statusStyles[o.status] || 'bg-gray-100'}`}>
                      {Object.keys(statusStyles).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3"><button onClick={(e) => { e.stopPropagation(); setDetail(o); setOwnerNotes(o.owner_notes || '') }} className="text-xs text-muted-foreground underline underline-offset-2">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setDetail(null)} />
          <div className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-xl md:w-[500px]">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-sm font-semibold">Order {detail.order_number || detail.id.slice(0, 8)}</h2>
              <button onClick={() => setDetail(null)}><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{new Date(detail.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
                  <select value={detail.status} onChange={(e) => handleStatusChange(detail.id, e.target.value)} className={`rounded-full px-3 py-1 text-xs font-medium outline-none ${statusStyles[detail.status] || 'bg-gray-100'}`}>
                    {Object.keys(statusStyles).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</h3>
                  <p className="mt-1 text-sm font-medium">{detail.customer_name}</p>
                  {detail.customer_phone && <a href={`https://wa.me/91${detail.customer_phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground underline underline-offset-2">{detail.customer_phone}</a>}
                  {detail.customer_email && <p className="text-xs text-muted-foreground">{detail.customer_email}</p>}
                </div>

                {detail.delivery_address && <div><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Delivery address</h3>
                  <p className="mt-1 text-sm">{detail.delivery_address.line1}{detail.delivery_address.line2 ? `, ${detail.delivery_address.line2}` : ''}<br />{detail.delivery_address.city}, {detail.delivery_address.state} — {detail.delivery_address.pincode}</p>
                </div>}

                <div><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Items</h3>
                  <div className="mt-2 space-y-2">
                    {(detail.order_items || []).map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-sm"><span>{item.product_name} <span className="text-muted-foreground">x{item.quantity}</span></span><span>₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}</span></div>
                    ))}
                  </div>
                  <div className="mt-3 border-t pt-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{detail.subtotal.toLocaleString('en-IN')}</span></div>{detail.delivery_fee > 0 && <div className="flex justify-between mt-1"><span className="text-muted-foreground">Delivery</span><span>₹{detail.delivery_fee.toLocaleString('en-IN')}</span></div>}<div className="flex justify-between mt-1 font-semibold"><span>Total</span><span>₹{detail.total.toLocaleString('en-IN')}</span></div></div>
                </div>

                <div><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment</h3>
                  <p className="mt-1 text-sm capitalize">{detail.payment_method}</p>
                </div>

                {detail.notes && <div><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer note</h3><p className="mt-1 text-sm text-muted-foreground">{detail.notes}</p></div>}

                <div><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Owner notes</h3>
                  <textarea rows={3} className="mt-1 w-full rounded-[10px] border border-input px-3 py-2.5 text-sm outline-none focus:border-foreground" placeholder="Internal notes..." value={ownerNotes} onChange={(e) => setOwnerNotes(e.target.value)} onBlur={() => handleNotesSave(detail.id)} />
                </div>

                <button onClick={() => window.print()} className="w-full rounded-[10px] border border-input py-3 text-sm font-medium">Print receipt</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
