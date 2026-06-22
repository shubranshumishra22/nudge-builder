'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Zap, Building2 } from 'lucide-react'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: '/mo',
    description: 'For getting started',
    accent: false,
    features: [
      '1 store',
      '5 products',
      'Free subdomain',
      'Basic storefront',
      'Powered by Nudge badge',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹499',
    period: '/mo',
    description: 'For growing businesses',
    accent: true,
    badge: 'Most popular',
    features: [
      'Up to 5 stores',
      'Unlimited products',
      'Custom domain',
      'Remove Nudge branding',
      'Priority support',
      'Advanced analytics',
      'Bulk order management',
      'Early access to features',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '₹2,499',
    period: '/mo',
    description: 'For teams & agencies',
    accent: false,
    badge: 'Best value',
    features: [
      'Unlimited stores',
      'Unlimited products',
      'Custom domains',
      'White-label storefront',
      'API access',
      'Dedicated account manager',
      'Team collaboration',
      'Custom integrations',
      '99.9% uptime SLA',
    ],
  },
]

export default function UpgradeClient({ profile }: { profile: any }) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currentPlan = profile?.plan || 'free'

  const handleUpgrade = async () => {
    if (!selected || selected === currentPlan) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create subscription')

      if (data.short_url) {
        window.open(data.short_url, '_blank')
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold tracking-tight">Pricing</h1>
      <p className="mt-1 text-sm text-muted-foreground">Choose the plan that fits your business</p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id && plan.id !== 'free'
          const isSelected = selected === plan.id

          return (
            <div
              key={plan.id}
              onClick={() => {
                if (!isCurrent) setSelected(plan.id)
              }}
              className={`relative rounded-xl bg-white p-6 transition-all cursor-pointer ${
                plan.accent && isSelected
                  ? 'border-2 border-[#0F0F0E] shadow-lg ring-1 ring-[#0F0F0E]/10'
                  : plan.accent
                  ? 'border-2 border-[#0F0F0E] shadow-md'
                  : isSelected
                  ? 'border-2 border-[#0F0F0E]'
                  : 'border border-input hover:border-[#0F0F0E]/40'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#0F0F0E] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  {plan.badge}
                </span>
              )}

              <div className="flex items-center gap-2">
                {plan.id === 'free' ? <Zap size={20} className="text-muted-foreground" /> :
                 plan.id === 'pro' ? <Zap size={20} className="text-[#0F0F0E]" /> :
                 <Building2 size={20} className="text-[#0F0F0E]" />}
                <h2 className="text-lg font-semibold">{plan.name}</h2>
              </div>

              <div className="mt-4">
                <span className="font-serif text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="mt-0.5 shrink-0 text-green-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (!isCurrent) {
                    setSelected(plan.id)
                  }
                }}
                disabled={isCurrent || loading}
                className={`mt-6 w-full rounded-[10px] py-3 text-sm font-semibold transition-all ${
                  isCurrent
                    ? 'bg-[#F4F3F0] text-muted-foreground cursor-default'
                    : plan.accent
                    ? 'bg-[#0F0F0E] text-white hover:opacity-90'
                    : 'border border-input hover:bg-[#F4F3F0]'
                }`}
              >
                {isCurrent ? 'Current plan' : loading && selected === plan.id ? 'Processing...' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
