'use client'

import { useState, useCallback } from 'react'
import { Search, Plus, Pencil, Trash2, X, GripVertical, Upload } from 'lucide-react'

interface Product {
  id: string; name: string; slug: string; description: string | null; price: number
  compare_at_price: number | null; category: string | null; sku: string | null
  stock_status: string; stock_quantity: number | null; is_featured: boolean; sort_order: number
}

export default function ProductsClient({
  store, products: initial, categories, imageMap,
}: {
  store: any; products: Product[]; categories: string[]; imageMap: Record<string, string>
}) {
  const [products, setProducts] = useState(initial)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [panel, setPanel] = useState<{ mode: 'add' | 'edit'; product?: Product } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const allSelected = selected.size === products.length
  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  function toggleAll() { if (allSelected) setSelected(new Set()); else setSelected(new Set(products.map((p) => p.id))) }
  function toggleOne(id: string) { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s) }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} products?`)) return
    for (const id of selected) {
      await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    }
    setProducts((p) => p.filter((x) => !selected.has(x.id)))
    setSelected(new Set())
  }

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload/image', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) setUploadedImages((prev) => [...prev, data.url])
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold tracking-tight">Products</h1>
        <button onClick={() => { setPanel({ mode: 'add' }); setUploadedImages([]) }} className="flex items-center gap-2 rounded-[10px] bg-[#0F0F0E] px-4 py-2.5 text-sm font-semibold text-white">
          <Plus size={16} /> Add product
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="w-full rounded-[10px] border border-input bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-foreground" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {selected.size > 0 && (
          <button onClick={handleBulkDelete} className="flex items-center gap-1.5 rounded-[10px] border border-red-200 px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50">
            <Trash2 size={14} /> Delete {selected.size}
          </button>
        )}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-[#F4F3F0] text-xs text-muted-foreground">
            <tr>
              <th className="w-10 px-3 py-3"><input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4" /></th>
              <th className="px-3 py-3 font-medium">Image</th>
              <th className="px-3 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Price</th>
              <th className="px-3 py-3 font-medium">Category</th>
              <th className="px-3 py-3 font-medium">Stock</th>
              <th className="w-20 px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-[#FAFAF8]">
                <td className="px-3 py-3"><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} className="h-4 w-4" /></td>
                <td className="px-3 py-3">
                  <div className="h-10 w-10 overflow-hidden rounded-lg bg-muted">
                    {imageMap[p.id] ? <img src={imageMap[p.id]} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">—</div>}
                  </div>
                </td>
                <td className="px-3 py-3 font-medium">{p.name}</td>
                <td className="px-3 py-3">₹{p.price.toLocaleString('en-IN')}</td>
                <td className="px-3 py-3 text-xs text-muted-foreground">{p.category || '—'}</td>
                <td className="px-3 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${p.stock_status === 'in_stock' ? 'bg-green-100 text-green-700' : p.stock_status === 'limited' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{p.stock_status.replace(/_/g, ' ')}</span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setPanel({ mode: 'edit', product: p }); setUploadedImages(imageMap[p.id] ? [imageMap[p.id]] : []) }} className="text-muted-foreground hover:text-[#0F0F0E]"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteConfirm(p)} className="text-muted-foreground hover:text-red-600"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {panel && <ProductPanel store={store} panel={panel} images={uploadedImages} onUpload={handleUpload} onClose={() => setPanel(null)} onSaved={(p: Product) => { if (panel.mode === 'add') setProducts((prev) => [...prev, p]); else setProducts((prev) => prev.map((x) => x.id === p.id ? p : x)); setPanel(null) }} />}
      {deleteConfirm && <DeleteDialog product={deleteConfirm} onClose={() => setDeleteConfirm(null)} onDeleted={(id: string) => { setProducts((p) => p.filter((x) => x.id !== id)); setDeleteConfirm(null) }} />}
    </div>
  )
}

function ProductPanel({ store, panel, images: initialImages, onUpload, onClose, onSaved }: any) {
  const isEdit = panel.mode === 'edit'
  const product = panel.product || {}
  const [form, setForm] = useState({ name: product.name || '', price: product.price?.toString() || '', compare_at_price: product.compare_at_price?.toString() || '', description: product.description || '', category: product.category || '', sku: product.sku || '', stock_status: product.stock_status || 'in_stock', stock_quantity: product.stock_quantity?.toString() || '', is_featured: product.is_featured || false })
  const [images, setImages] = useState<string[]>(initialImages)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const body: any = { store_id: store.id, name: form.name, price: parseFloat(form.price), compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null, description: form.description, category: form.category, sku: form.sku, stock_status: form.stock_status, stock_quantity: form.stock_status === 'limited' ? parseInt(form.stock_quantity) : null, is_featured: form.is_featured }
    if (isEdit) body.id = product.id

    const res = await fetch('/api/products', { method: isEdit ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    if (data.product) {
      fetch('/api/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: store.slug }) })
      onSaved(data.product)
    }
    setSaving(false)
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-xl md:w-[400px]">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-sm font-semibold">{isEdit ? 'Edit product' : 'Add product'}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-4">
            <div><label className="mb-1 block text-xs font-medium">Name *</label><input className="w-full rounded-[10px] border border-input px-3 py-2.5 text-sm outline-none focus:border-foreground" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-xs font-medium">Price (₹) *</label><input type="number" className="w-full rounded-[10px] border border-input px-3 py-2.5 text-sm outline-none focus:border-foreground" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div><label className="mb-1 block text-xs font-medium">Compare-at price</label><input type="number" className="w-full rounded-[10px] border border-input px-3 py-2.5 text-sm outline-none focus:border-foreground" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} /></div>
            </div>
            <div><label className="mb-1 block text-xs font-medium">Description</label><textarea rows={3} className="w-full rounded-[10px] border border-input px-3 py-2.5 text-sm outline-none focus:border-foreground" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-xs font-medium">Category</label><input list="cats" className="w-full rounded-[10px] border border-input px-3 py-2.5 text-sm outline-none focus:border-foreground" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /><datalist id="cats">{(store.categories || []).map((c: string) => <option key={c} value={c} />)}</datalist></div>
              <div><label className="mb-1 block text-xs font-medium">SKU</label><input className="w-full rounded-[10px] border border-input px-3 py-2.5 text-sm outline-none focus:border-foreground" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-xs font-medium">Stock status</label><select className="w-full rounded-[10px] border border-input px-3 py-2.5 text-sm outline-none" value={form.stock_status} onChange={(e) => setForm({ ...form, stock_status: e.target.value })}><option value="in_stock">In stock</option><option value="limited">Limited</option><option value="out_of_stock">Out of stock</option></select></div>
              {form.stock_status === 'limited' && <div><label className="mb-1 block text-xs font-medium">Quantity</label><input type="number" className="w-full rounded-[10px] border border-input px-3 py-2.5 text-sm outline-none focus:border-foreground" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} /></div>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Images</label>
              <div className="flex flex-wrap gap-2">
                {images.map((url: string, i: number) => (
                  <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border"><img src={url} alt="" className="h-full w-full object-cover" /><button className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/50 text-white" onClick={() => setImages(images.filter((_, j) => j !== i))}><X size={10} /></button></div>
                ))}
                {images.length < 5 && <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed text-muted-foreground hover:bg-[#F4F3F0]"><input type="file" accept="image/*" className="hidden" onChange={onUpload} /><Upload size={18} /></label>}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="h-4 w-4" /> Featured product</label>
          </div>
        </div>
        <div className="border-t px-5 py-4">
          <button onClick={handleSave} disabled={saving || !form.name || !form.price} className="w-full rounded-[10px] bg-[#0F0F0E] py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </>
  )
}

function DeleteDialog({ product, onClose, onDeleted }: any) {
  const [deleting, setDeleting] = useState(false)
  const handleDelete = async () => {
    setDeleting(true)
    await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id }) })
    onDeleted(product.id)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-sm font-semibold">Delete {product.name}?</h3>
        <p className="mt-2 text-xs text-muted-foreground">This cannot be undone.</p>
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-[10px] border border-input px-4 py-2 text-xs font-medium">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="rounded-[10px] bg-red-600 px-4 py-2 text-xs font-medium text-white">{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
      </div>
    </div>
  )
}


