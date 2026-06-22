'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Package, Plus, Share2, Eye, Palette, Copy, Check } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    live: 'bg-green-100 text-green-700',
    draft: 'bg-yellow-100 text-yellow-700',
    suspended: 'bg-red-100 text-red-700',
    pending: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    delivered: 'bg-green-100 text-green-700',
  }
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

export default function DashboardHomeClient({
  greeting, name, store, stats, orders,
}: {
  greeting: string; name: string; store: any; stats: any; orders: any[]
}) {
  const [copied, setCopied] = useState(false)

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package size={40} className="text-muted-foreground/40" />
        <h2 className="mt-4 font-serif text-2xl font-bold">Welcome to Nudge</h2>
        <p className="mt-2 text-sm text-muted-foreground">Create your first store to get started.</p>
        <Link href="/onboard" className="mt-6 rounded-[10px] bg-[#0F0F0E] px-6 py-3 text-sm font-semibold text-white">Create store</Link>
      </div>
    )
  }

  const storeUrl = `http://localhost:3001/${store.slug}`

  const quickActions = [
    { label: 'Add product', icon: Plus, href: '/dashboard/products', desc: 'Add a new product' },
    { label: 'Share store', icon: Share2, href: '#', desc: 'Copy store link', onClick: () => { navigator.clipboard.writeText(storeUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) } },
    { label: 'View live', icon: Eye, href: storeUrl, external: true, desc: 'Visit storefront' },
    { label: 'Edit appearance', icon: Palette, href: '/dashboard/appearance', desc: 'Customize theme' },
  ]

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold tracking-tight">{greeting}, {name}.</h1>

      <div className="mt-4 flex items-center gap-3">
        <StatusBadge status={store.status} />
        <button
          onClick={() => { navigator.clipboard.writeText(storeUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="flex items-center gap-1.5 rounded-md bg-[#F4F3F0] px-3 py-1.5 text-xs text-muted-foreground hover:text-[#0F0F0E]"
        >
          <code className="text-[11px]">{store.slug}.nudge.store</code>
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
        <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground underline underline-offset-2">View live store</a>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total orders', value: stats?.totalOrders ?? 0 },
          { label: 'Revenue this month', value: `₹${(stats?.revenueThisMonth || 0).toLocaleString('en-IN')}` },
          { label: 'Products listed', value: stats?.productCount ?? 0 },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-[#F4F3F0] p-5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-serif text-2xl font-bold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((a) => {
          const Icon = a.icon
          const inner = (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-5 text-center transition-colors hover:bg-[#F4F3F0]">
              <Icon size={22} className="text-muted-foreground" />
              <div>
                <p className="text-xs font-medium">{a.label}</p>
                <p className="text-[10px] text-muted-foreground">{copied && a.label === 'Share store' ? 'Copied!' : a.desc}</p>
              </div>
            </div>
          )
          if (a.external) return <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer">{inner}</a>
          if (a.onClick) return <button key={a.label} onClick={a.onClick} className="text-left">{inner}</button>
          return <Link key={a.label} href={a.href}>{inner}</Link>
        })}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent orders</h2>
          <Link href="/dashboard/orders" className="text-xs text-muted-foreground underline underline-offset-2">View all orders →</Link>
        </div>
        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-[#F4F3F0] text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{o.order_number || o.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">{o.customer_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.order_items?.length || 0}</td>
                    <td className="px-4 py-3 font-medium">₹{o.total.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
