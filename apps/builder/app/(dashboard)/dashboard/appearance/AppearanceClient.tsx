'use client'

import { useState } from 'react'
import { GripVertical, Instagram, Facebook, Twitter, Youtube, Upload, X } from 'lucide-react'

const fontStyles = [
  { id: 'modern', label: 'Modern', preview: 'Inter, system-ui' },
  { id: 'classic', label: 'Classic', preview: 'Georgia, serif' },
  { id: 'playful', label: 'Playful', preview: "'Comic Neue', cursive" },
  { id: 'minimal', label: 'Minimal', preview: "'SF Pro', -apple-system" },
]

const defaultSections = [
  { id: 'hero', label: 'Hero banner' },
  { id: 'products', label: 'Featured products' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

export default function AppearanceClient({ store, theme: initial }: { store: any; theme: any }) {
  const [theme, setTheme] = useState(initial || { primary_color: '#4F46E5', accent_color: '#F59E0B', background_color: '#FAFAF8', font_style: 'modern', sections_order: ['hero', 'products', 'about', 'contact'], sections_enabled: { hero: true, products: true, about: true, contact: true }, social_links: {} })
  const [saving, setSaving] = useState(false)

  const update = (key: string, value: any) => setTheme({ ...theme, [key]: value })

  const toggleSection = (id: string) => {
    const enabled = { ...(theme.sections_enabled || {}) }
    enabled[id] = !enabled[id]
    update('sections_enabled', enabled)
  }

  const moveSection = (index: number, dir: number) => {
    const order = [...(theme.sections_order || [])]
    const target = index + dir
    if (target < 0 || target >= order.length) return
    ;[order[index], order[target]] = [order[target], order[index]]
    update('sections_order', order)
  }

  const handleSave = async () => {
    setSaving(true)
    await fetch(`/api/stores/${store.id}/theme`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      primary_color: theme.primary_color,
      accent_color: theme.accent_color,
      background_color: theme.background_color,
      font_style: theme.font_style,
      sections_order: theme.sections_order,
      sections_enabled: theme.sections_enabled,
      social_links: theme.social_links,
    }) })
    await fetch('/api/revalidate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: store.slug }) })
    setSaving(false)
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold tracking-tight">Appearance</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold">Colors</h2>
            <div className="mt-3 grid grid-cols-3 gap-4">
              {['primary_color', 'accent_color', 'background_color'].map((key) => (
                <div key={key}>
                  <label className="mb-1 block text-xs capitalize text-muted-foreground">{key.replace('_', ' ')}</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={theme[key] || '#000000'} onChange={(e) => update(key, e.target.value)} className="h-9 w-9 cursor-pointer rounded-lg border" />
                    <input value={theme[key] || ''} onChange={(e) => update(key, e.target.value)} className="flex-1 rounded-[10px] border border-input px-2.5 py-2 text-xs outline-none focus:border-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Typography</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {fontStyles.map((f) => (
                <button key={f.id} onClick={() => update('font_style', f.id)} className={`rounded-xl border p-4 text-left transition-colors ${theme.font_style === f.id ? 'border-[#0F0F0E] bg-[#F4F3F0]' : 'hover:bg-[#F4F3F0]'}`}>
                  <p className="text-sm font-medium">{f.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground" style={{ fontFamily: f.preview }}>Aa</p>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Sections</h2>
            <div className="mt-3 space-y-2">
              {defaultSections.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveSection(i, -1)} className="text-muted-foreground hover:text-[#0F0F0E]" disabled={i === 0}><svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M5 0L10 6H0z"/></svg></button>
                      <button onClick={() => moveSection(i, 1)} className="text-muted-foreground hover:text-[#0F0F0E]" disabled={i === defaultSections.length - 1}><svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0h10z"/></svg></button>
                    </div>
                    <span className="text-sm">{s.label}</span>
                  </div>
                  <button onClick={() => toggleSection(s.id)} className={`relative h-5 w-9 rounded-full transition-colors ${theme.sections_enabled?.[s.id] !== false ? 'bg-[#0F0F0E]' : 'bg-muted-foreground/30'}`}>
                    <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${theme.sections_enabled?.[s.id] !== false ? 'translate-x-4' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Social links</h2>
            <div className="mt-3 space-y-3">
              {[
                { key: 'instagram', icon: Instagram, label: 'Instagram' },
                { key: 'facebook', icon: Facebook, label: 'Facebook' },
                { key: 'twitter', icon: Twitter, label: 'Twitter / X' },
                { key: 'youtube', icon: Youtube, label: 'YouTube' },
              ].map((s) => {
                const Icon = s.icon
                const links = (theme.social_links || {}) as Record<string, string>
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <Icon size={16} className="text-muted-foreground" />
                    <input placeholder={`${s.label} URL`} value={links[s.key] || ''} onChange={(e) => update('social_links', { ...links, [s.key]: e.target.value })} className="flex-1 rounded-[10px] border border-input px-3 py-2.5 text-sm outline-none focus:border-foreground" />
                  </div>
                )
              })}
            </div>
          </section>

          <button onClick={handleSave} disabled={saving} className="w-full rounded-[10px] bg-[#0F0F0E] py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save changes'}</button>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-24 overflow-hidden rounded-xl border">
            <div className="bg-[#F4F3F0] px-4 py-2 text-xs font-medium text-muted-foreground">Preview</div>
            <iframe src={`http://localhost:3001/${store.slug}`} className="h-[600px] w-full" title="Store preview" />
          </div>
        </div>
      </div>
    </div>
  )
}
