import Link from 'next/link'
import { Check, Zap, Building2, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const plans = [
    { name: 'Free', price: '₹0', icon: Zap, features: ['1 store', '5 products', 'Free subdomain', 'Basic storefront', 'Nudge badge', 'Email support'], cta: 'Get started', href: '/login' },
    { name: 'Pro', price: '₹499', icon: Zap, features: ['Up to 5 stores', 'Unlimited products', 'Custom domain', 'No Nudge branding', 'Priority support', 'Advanced analytics'], cta: 'Start free trial', href: '/login', accent: true, badge: 'Most popular' },
    { name: 'Agency', price: '₹2,499', icon: Building2, features: ['Unlimited stores', 'Unlimited products', 'Custom domains', 'White-label', 'API access', 'Dedicated manager'], cta: 'Contact sales', href: '/login' },
  ]

  const steps = [
    { title: 'Describe your business', desc: 'Tell us what you sell and we\'ll generate a stunning storefront tailored to your brand.' },
    { title: 'Preview your store', desc: 'Review the AI-generated design, tweak colors and content, and add your products.' },
    { title: 'Go live instantly', desc: 'Publish with one click. Your store is live on your own subdomain, ready for customers.' },
  ]

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: '#FAFAF8' }}>
      <header className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="https://i.postimg.cc/fyvVwyF5/Chat-GPT-Image-Jun-22-2026-08-08-03-PM.png" alt="Nudge" className="h-7 w-7 rounded-[8px] object-cover" />
            <span className="text-sm font-bold tracking-tight">Nudge</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">How it works</Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
            <Link href="/login" className="text-sm font-medium text-foreground">Sign in</Link>
            <Link href="/login" className="rounded-[10px] bg-[#0F0F0E] px-5 py-2.5 text-sm font-semibold text-white">Create my store</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="flex min-h-[85vh] items-center justify-center px-4 pt-16">
          <div className="max-w-3xl text-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight md:text-6xl">
              Your store, live in{' '}
              <span className="text-[#F97316]">5 minutes</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Nudge uses AI to create a beautiful, Indian-optimized e-commerce storefront. No coding, no hassle.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login" className="rounded-[10px] bg-[#0F0F0E] px-8 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                Create my store
              </Link>
              <Link href="#how-it-works" className="flex items-center gap-2 rounded-[10px] border border-input px-8 py-3.5 text-sm font-medium transition-colors hover:bg-accent">
                See a demo <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y py-8">
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-center text-sm text-muted-foreground">Join 1,200+ small businesses already on Nudge</p>
            <div className="mt-4 flex items-center justify-center gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F3F0] text-xs font-medium text-muted-foreground">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-serif text-3xl font-bold tracking-tight">How it works</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <div key={i} className="rounded-xl border bg-white p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#F4F3F0] text-lg font-bold text-[#0F0F0E]">{i + 1}</div>
                  <h3 className="mt-5 font-serif text-xl font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-serif text-3xl font-bold tracking-tight">Beautiful storefronts</h2>
            <div className="mt-8 flex gap-6 overflow-x-auto pb-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 w-60 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                  <img src={`https://picsum.photos/seed/store${i}/240/320`} alt={`Store template ${i}`} className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-serif text-3xl font-bold tracking-tight">Simple pricing</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">Start free, upgrade when you grow</p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <div key={plan.name} className={`relative rounded-xl bg-white p-6 transition-all ${plan.accent ? 'border-2 border-[#0F0F0E] shadow-md' : 'border border-input'}`}>
                  {plan.badge && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#0F0F0E] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">{plan.badge}</span>}
                  <div className="flex items-center gap-2"><plan.icon size={20} className={plan.accent ? 'text-[#0F0F0E]' : 'text-muted-foreground'} /><h3 className="text-lg font-semibold">{plan.name}</h3></div>
                  <div className="mt-4"><span className="font-serif text-3xl font-bold">{plan.price}</span><span className="text-sm text-muted-foreground">/mo</span></div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm"><Check size={14} className="mt-0.5 shrink-0 text-green-600" /><span>{f}</span></li>
                    ))}
                  </ul>
                  <Link href={plan.href} className={`mt-6 flex w-full items-center justify-center rounded-[10px] py-3 text-sm font-semibold transition-all ${plan.accent ? 'bg-[#0F0F0E] text-white hover:opacity-90' : 'border border-input hover:bg-[#F4F3F0]'}`}>
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2"><img src="https://i.postimg.cc/fyvVwyF5/Chat-GPT-Image-Jun-22-2026-08-08-03-PM.png" alt="Nudge" className="h-7 w-7 rounded-[8px] object-cover" /><span className="text-sm font-bold tracking-tight">Nudge</span></div>
              <p className="mt-1 text-sm text-muted-foreground">AI-powered e-commerce for Indian small businesses</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">About</a>
              <a href="#" className="hover:text-foreground">Blog</a>
              <a href="#" className="hover:text-foreground">Twitter</a>
              <a href="#" className="hover:text-foreground">Instagram</a>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground">Made in Bengaluru 🇮🇳</p>
        </div>
      </footer>
    </div>
  )
}
