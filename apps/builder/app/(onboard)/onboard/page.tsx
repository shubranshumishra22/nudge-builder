'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, Plus, X, Upload } from 'lucide-react'
import { createBrowserSupabaseClient } from '@nudge/db'

const step1Schema = z.object({
  business_name: z
    .string()
    .min(2, 'Must be at least 2 characters')
    .max(60, 'Must be under 60 characters'),
  business_type: z.enum(
    ['cafe', 'bakery', 'clothing', 'fitness', 'handmade', 'restaurant', 'beauty', 'generic'],
    { required_error: 'Select a business type' },
  ),
  description: z
    .string()
    .min(20, 'Describe your business in at least 20 characters')
    .max(200, 'Keep it under 200 characters'),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color'),
})

type Step1Data = z.infer<typeof step1Schema>

interface ProductItem {
  id: string
  name: string
  price: string
  description: string
  photoPreview: string | null
}

const BUSINESS_TYPES = [
  { value: 'cafe', label: 'Cafe / Coffee Shop' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'clothing', label: 'Clothing & Fashion' },
  { value: 'fitness', label: 'Fitness & Wellness' },
  { value: 'handmade', label: 'Handmade & Crafts' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'beauty', label: 'Beauty & Salon' },
  { value: 'generic', label: 'Other' },
] as const

const STATUS_TEXTS = [
  'Analysing your business...',
  'Choosing the right template...',
  'Building your store...',
]

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
              s < current
                ? 'bg-foreground text-background'
                : s === current
                  ? 'border-2 border-foreground bg-foreground text-background'
                  : 'border-2 border-muted-foreground/30 text-muted-foreground'
            }`}
          >
            {s < current ? <Check className="h-4 w-4" /> : s}
          </div>
          {s < 3 && (
            <div
              className={`h-0.5 w-8 transition-colors duration-300 ${
                s < current ? 'bg-foreground' : 'bg-muted-foreground/20'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted ${className ?? ''}`}
    />
  )
}

export default function OnboardPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [products, setProducts] = useState<ProductItem[]>([])
  const [error, setError] = useState('')
  const [statusIndex, setStatusIndex] = useState(0)
  const [generating, setGenerating] = useState(false)
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map())
  const initiatedRef = useRef(false)

  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      business_name: '',
      business_type: undefined,
      description: '',
      primary_color: '#4F46E5',
    },
  })

  useEffect(() => {
    if (step !== 3) return
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_TEXTS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [step])

  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    try {
      const payload = {
        name: step1Data!.business_name,
        type: step1Data!.business_type,
        description: step1Data!.description,
        colors: { primary: step1Data!.primary_color },
        products: products
          .filter((p) => p.name.trim())
          .map((p) => ({
            name: p.name,
            price: parseInt(p.price) || 0,
            description: p.description,
          })),
      }

      const res = await fetch('/api/stores/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Generation failed')
      }

      const { storeId } = await res.json()
      router.push(`/onboard/preview?store=${storeId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setGenerating(false)
    }
  }, [step1Data, products, router, supabase, setGenerating])

  useEffect(() => {
    if (step !== 3 || !step1Data || initiatedRef.current) return
    initiatedRef.current = true
    handleGenerate()
  }, [step, step1Data, handleGenerate])

  function handleStep1Submit(data: Step1Data) {
    setDirection(1)
    setStep1Data(data)
    setStep(2)
  }

  function goBack() {
    setDirection(-1)
    setStep((s) => Math.max(1, s - 1))
  }

  function addProduct() {
    if (products.length >= 5) return
    setProducts((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', price: '', description: '', photoPreview: null },
    ])
  }

  function removeProduct(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  function updateProduct(id: string, field: keyof ProductItem, value: string) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    )
  }

  function handlePhotoSelect(id: string, file: File | null) {
    if (!file) return
    const preview = URL.createObjectURL(file)
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, photoPreview: preview } : p)),
    )
  }

  async function handleStep2Submit() {
    const backup = { step1Data, products }
    localStorage.setItem('nudge_onboard_backup', JSON.stringify(backup))
    setDirection(1)
    setStep(3)
  }

  if (step === 3) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="w-full max-w-md px-4">
          <div className="space-y-4">
            <SkeletonBlock className="h-6 w-48" />
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-64 w-full rounded-xl" />
            <div className="grid grid-cols-3 gap-3">
              <SkeletonBlock className="aspect-square rounded-xl" />
              <SkeletonBlock className="aspect-square rounded-xl" />
              <SkeletonBlock className="aspect-square rounded-xl" />
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="animate-pulse text-lg font-medium text-foreground transition-opacity">
              {STATUS_TEXTS[statusIndex]}
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => { initiatedRef.current = false; handleGenerate() }}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#FAFAF8' }}>
      <div className="w-full max-w-[480px]">
        <div className="mb-10">
          <StepIndicator current={step} />
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            >
              <h1 className="font-serif text-[32px] font-bold leading-tight tracking-tight">
                Tell us about your business
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We&apos;ll use this to generate your store.
              </p>

              <form onSubmit={form.handleSubmit(handleStep1Submit)} className="mt-8 space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Business name</label>
                  <input
                    {...form.register('business_name')}
                    className="w-full rounded-[10px] border border-input bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-foreground focus:ring-1 focus:ring-foreground"
                    placeholder="My Store"
                  />
                  {form.formState.errors.business_name && (
                    <p className="mt-1 text-xs text-red-500">{form.formState.errors.business_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Business type</label>
                  <select
                    {...form.register('business_type')}
                    className="w-full rounded-[10px] border border-input bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-foreground focus:ring-1 focus:ring-foreground"
                  >
                    <option value="">Select...</option>
                    {BUSINESS_TYPES.map((bt) => (
                      <option key={bt.value} value={bt.value}>
                        {bt.label}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.business_type && (
                    <p className="mt-1 text-xs text-red-500">{form.formState.errors.business_type.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Description</label>
                  <textarea
                    {...form.register('description')}
                    rows={3}
                    className="w-full resize-none rounded-[10px] border border-input bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-foreground focus:ring-1 focus:ring-foreground"
                    placeholder="I sell handmade soy candles from Pune, made to order..."
                  />
                  {form.formState.errors.description && (
                    <p className="mt-1 text-xs text-red-500">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Brand color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      {...form.register('primary_color')}
                      className="h-10 w-10 cursor-pointer rounded-lg border border-input"
                    />
                    <span className="font-mono text-sm text-muted-foreground">
                      {form.watch('primary_color')}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-[10px] bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  Next: Add products &rarr;
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            >
              <h1 className="font-serif text-[32px] font-bold leading-tight tracking-tight">
                What do you sell?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Add up to 5 products to get started.
              </p>

              <div className="mt-8 space-y-4">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="relative rounded-xl border border-input bg-white p-4"
                  >
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="flex gap-4">
                      <div className="shrink-0">
                        {product.photoPreview ? (
                          <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                            <img
                              src={product.photoPreview}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => updateProduct(product.id, 'photoPreview', '')}
                              className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current.get(product.id)?.click()}
                            className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-input text-muted-foreground hover:border-foreground hover:text-foreground"
                          >
                            <Upload className="h-5 w-5" />
                          </button>
                        )}
                        <input
                          ref={(el) => {
                            if (el) fileInputRefs.current.set(product.id, el)
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handlePhotoSelect(product.id, e.target.files?.[0] ?? null)
                          }
                        />
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <input
                              placeholder="Product name"
                              value={product.name}
                              onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                              className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus:border-foreground"
                            />
                          </div>
                          <div className="w-24">
                            <input
                              placeholder="₹ Price"
                              type="number"
                              value={product.price}
                              onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                              className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus:border-foreground"
                            />
                          </div>
                        </div>
                        <textarea
                          placeholder="Short description (optional)"
                          value={product.description}
                          onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                          rows={2}
                          className="w-full resize-none rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus:border-foreground"
                        />
                      </div>
                    </div>

                    <div className="mt-2 text-right text-xs text-muted-foreground">
                      Product {index + 1} of 5
                    </div>
                  </div>
                ))}
              </div>

              {products.length < 5 && (
                <button
                  type="button"
                  onClick={addProduct}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input px-4 py-4 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Add product
                </button>
              )}

              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleStep2Submit}
                  className="w-full rounded-[10px] bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  Next: Preview your store &rarr;
                </button>
                <button
                  type="button"
                  onClick={handleStep2Submit}
                  className="text-center text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  onClick={goBack}
                  className="text-center text-sm text-muted-foreground hover:text-foreground"
                >
                  &larr; Back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
