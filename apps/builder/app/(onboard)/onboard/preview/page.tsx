'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, Sparkles } from 'lucide-react'

function AnimatedCheckmark() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="mx-auto">
      <circle cx="32" cy="32" r="28" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="176" className="animate-[drawCircle_400ms_ease_forwards]" />
      <path d="M20 32l8 8 16-16" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="34" className="animate-[drawCheck_300ms_ease_200ms_forwards]" />
    </svg>
  )
}

export default function PreviewPage() {
  const router = useRouter()
  const [storeId, setStoreId] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [storeUrl, setStoreUrl] = useState('')
  const [displayUrl, setDisplayUrl] = useState('')
  const [typedUrl, setTypedUrl] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setStoreId(params.get('store'))
  }, [])

  const handlePublish = useCallback(async () => {
    if (!storeId || publishing) return
    setPublishing(true)

    try {
      const res = await fetch(`/api/stores/${storeId}/publish`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to publish')

      setStoreUrl(data.url || `https://${data.slug}.nudge.store`)
      setDisplayUrl(data.url || `${data.slug}.nudge.store`)

      setTimeout(() => {
        setPublished(true)
        setPublishing(false)

        let i = 0
        const url = data.url || `${data.slug}.nudge.store`
        const interval = setInterval(() => {
          i++
          setTypedUrl(url.slice(0, i))
          if (i >= url.length) clearInterval(interval)
        }, 20)

        try {
          import('canvas-confetti').then((confetti) => {
            if (btnRef.current) {
              const rect = btnRef.current.getBoundingClientRect()
              confetti.default({
                particleCount: 80,
                spread: 60,
                origin: {
                  x: (rect.left + rect.width / 2) / window.innerWidth,
                  y: (rect.top + rect.height / 2) / window.innerHeight,
                },
                colors: ['#F97316', '#0F0F0E', '#FFFFFF'],
              })
            }
          })
        } catch {}

        setToastVisible(true)
        setTimeout(() => setToastVisible(false), 5000)
      }, 400)
    } catch (err) {
      setPublishing(false)
    }
  }, [storeId, publishing])

  return (
    <main className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#FAFAF8' }}>
      <div className="max-w-md px-4 text-center">
        {published ? (
          <>
            <AnimatedCheckmark />
            <h1 className="mt-6 font-serif text-3xl font-bold tracking-tight">Your store is live!</h1>
            <div className="mt-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(storeUrl)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className="inline-flex items-center gap-2 rounded-[10px] border border-input bg-white px-5 py-3 text-sm font-medium transition-colors hover:bg-[#F4F3F0]"
              >
                {typedUrl || displayUrl}
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              </button>
            </div>
            <div className="mt-6 flex flex-col items-center gap-3">
              <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="rounded-[10px] bg-[#0F0F0E] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">View your store</a>
              <button onClick={() => router.push('/dashboard')} className="text-sm text-muted-foreground underline underline-offset-2">Go to dashboard</button>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F0F0E]"><Sparkles size={28} className="text-white" /></div>
            <h1 className="mt-6 font-serif text-3xl font-bold tracking-tight">Your store is ready</h1>
            <p className="mt-2 text-sm text-muted-foreground">Review everything looks good, then publish your store to the world.</p>
            {storeId && (
              <div className="mt-6 flex flex-col items-center gap-3">
                <a href={`http://localhost:3001/${storeId}`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground underline underline-offset-2">Preview storefront</a>
                <button ref={btnRef} onClick={handlePublish} disabled={publishing} className="inline-flex items-center gap-2 rounded-[10px] bg-[#F97316] px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-[#E86A0E] disabled:opacity-70">
                  {publishing && (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                    </svg>
                  )}
                  {publishing ? 'Publishing...' : 'Publish store'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {toastVisible && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 animate-slideDown">
          <div className="flex items-center gap-3 rounded-xl bg-[#0F0F0E] px-5 py-3 text-sm text-white shadow-lg">
            <span>Your store is live! Share it</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(storeUrl)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
