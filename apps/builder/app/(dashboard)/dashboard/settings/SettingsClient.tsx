'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function SettingsClient({ store: initial, owner }: { store: any; owner: any }) {
  const router = useRouter()
  const [store, setStore] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const update = (key: string, value: any) => setStore({ ...store, [key]: value })

  const handleSave = async (section: string) => {
    setSaving(true)
    await fetch(`/api/stores/${store.id}/theme`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      name: store.name, slug: store.slug, description: store.description, tagline: store.tagline,
      whatsapp_number: store.whatsapp_number, contact_email: store.contact_email, contact_address: store.contact_address,
      delivery_fee: store.delivery_fee, free_delivery_above: store.free_delivery_above, cod_enabled: store.cod_enabled,
    }) })
    if (section !== 'delivery') {
      await fetch('/api/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: store.slug }) })
    } else {
      await fetch('/api/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: store.slug }) })
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    await fetch(`/api/stores/${store.id}`, { method: 'DELETE' })
    router.push('/dashboard')
  }

  const inputClass = 'w-full rounded-[10px] border border-input bg-white px-4 py-2.5 text-sm outline-none focus:border-foreground'
  const labelClass = 'mb-1 block text-xs font-medium'
  const sectionClass = 'rounded-xl border bg-white p-6'

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl font-bold tracking-tight">Settings</h1>

      <div className="mt-6 space-y-6">
        <div className={sectionClass}>
          <h2 className="text-sm font-semibold">Store info</h2>
          <div className="mt-4 space-y-4">
            <div><label className={labelClass}>Store name</label><input className={inputClass} value={store.name} onChange={(e) => update('name', e.target.value)} /></div>
            <div><label className={labelClass}>Tagline</label><input className={inputClass} value={store.tagline || ''} onChange={(e) => update('tagline', e.target.value)} placeholder="Short tagline for your store" /></div>
            <div><label className={labelClass}>Description</label><textarea rows={3} className={inputClass} value={store.description || ''} onChange={(e) => update('description', e.target.value)} /></div>
            <button onClick={() => handleSave('info')} disabled={saving} className="rounded-[10px] bg-[#0F0F0E] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Save</button>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="text-sm font-semibold">Contact</h2>
          <div className="mt-4 space-y-4">
            <div><label className={labelClass}>WhatsApp number</label><input className={inputClass} value={store.whatsapp_number || ''} onChange={(e) => update('whatsapp_number', e.target.value)} placeholder="9876543210" /></div>
            <div><label className={labelClass}>Email</label><input className={inputClass} type="email" value={store.contact_email || ''} onChange={(e) => update('contact_email', e.target.value)} /></div>
            <div><label className={labelClass}>Address</label><textarea rows={2} className={inputClass} value={store.contact_address || ''} onChange={(e) => update('contact_address', e.target.value)} /></div>
            <button onClick={() => handleSave('contact')} disabled={saving} className="rounded-[10px] bg-[#0F0F0E] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Save</button>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="text-sm font-semibold">Delivery</h2>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Delivery fee (₹)</label><input type="number" className={inputClass} value={store.delivery_fee || 0} onChange={(e) => update('delivery_fee', parseInt(e.target.value) || 0)} /></div>
              <div><label className={labelClass}>Free above (₹)</label><input type="number" className={inputClass} value={store.free_delivery_above || ''} onChange={(e) => update('free_delivery_above', e.target.value ? parseInt(e.target.value) : null)} placeholder="Leave empty to disable" /></div>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={store.cod_enabled || false} onChange={(e) => update('cod_enabled', e.target.checked)} className="h-4 w-4" /> Enable cash on delivery</label>
            <button onClick={() => handleSave('delivery')} disabled={saving} className="rounded-[10px] bg-[#0F0F0E] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Save</button>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="text-sm font-semibold">Domain</h2>
          <div className="mt-4">
            <p className="text-sm"><code className="rounded bg-[#F4F3F0] px-2 py-0.5 text-xs">{store.slug}.nudge.store</code></p>
            <p className="mt-2 text-xs text-muted-foreground">Upgrade to Pro to connect a custom domain.</p>
          </div>
        </div>

        <div className={sectionClass}>
          <h2 className="text-sm font-semibold">Notifications</h2>
          <div className="mt-4 space-y-4">
            <div><label className={labelClass}>WhatsApp number for order alerts</label><input className={inputClass} value={store.whatsapp_number || ''} onChange={(e) => update('whatsapp_number', e.target.value)} /></div>
            <div><label className={labelClass}>Email for order alerts</label><input className={inputClass} type="email" value={owner?.email || store.contact_email || ''} /></div>
            <button onClick={() => handleSave('notifications')} disabled={saving} className="rounded-[10px] bg-[#0F0F0E] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Save</button>
          </div>
        </div>

        <div className={`${sectionClass} border-red-200`}>
          <h2 className="text-sm font-semibold text-red-600">Danger zone</h2>
          <p className="mt-1 text-xs text-muted-foreground">Permanently delete your store and all its data.</p>
          <button onClick={() => setDeleteConfirm(true)} className="mt-3 flex items-center gap-2 rounded-[10px] border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"><Trash2 size={16} />Delete store</button>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-sm font-semibold">Delete {store.name}?</h3>
            <p className="mt-2 text-xs text-muted-foreground">This permanently deletes your store, products, orders, and all data. This cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(false)} className="rounded-[10px] border border-input px-4 py-2 text-xs font-medium">Cancel</button>
              <button onClick={handleDelete} className="rounded-[10px] bg-red-600 px-4 py-2 text-xs font-medium text-white">Delete permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
