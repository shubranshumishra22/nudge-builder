'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Paintbrush, Settings, ArrowUpCircle, Menu, X, ChevronUp, Sparkles, LogOut } from 'lucide-react'
import { createBrowserSupabaseClient } from '@nudge/db'
import ChatBox from './dashboard/components/ChatBox'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/ai', label: 'AI Builder', icon: Sparkles },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/dashboard/appearance', label: 'Appearance', icon: Paintbrush },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const upgradeItem = { href: '/dashboard/upgrade', label: 'Upgrade', icon: ArrowUpCircle }

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
}

function truncateEmail(email: string, max = 22) {
  return email.length > max ? email.slice(0, max) + '…' : email
}

export default function DashboardLayoutClient({
  user,
  stores,
  activeStore,
  children,
}: {
  user: any
  stores: any[]
  activeStore: any
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const ownerStore = activeStore
  const plan = 'free'

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]" style={{ backgroundColor: '#FAFAF8' }}>
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-[220px] flex-col border-r bg-white md:flex">
          <div className="flex items-center gap-2 border-b px-5 py-4">
            <img src="https://i.postimg.cc/fyvVwyF5/Chat-GPT-Image-Jun-22-2026-08-08-03-PM.png" alt="Nudge" className="h-7 w-7 rounded-[8px] object-cover" />
            <span className="text-sm font-bold tracking-tight">Nudge</span>
          </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-[#F4F3F0] font-medium text-[#0F0F0E]'
                    : 'text-muted-foreground hover:bg-[#F4F3F0] hover:text-[#0F0F0E]'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
          <div className="my-2 border-t" />
          {(() => {
            const active = pathname === upgradeItem.href
            return (
              <Link
                href={upgradeItem.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-[#F4F3F0] font-medium text-[#0F0F0E]'
                    : 'text-muted-foreground hover:bg-[#F4F3F0] hover:text-[#0F0F0E]'
                }`}
              >
                <upgradeItem.icon size={18} />
                {upgradeItem.label}
              </Link>
            )
          })()}
        </nav>

        <div className="border-t px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F0F0E] text-xs font-medium text-white">
              {getInitials(user.email || '')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{truncateEmail(user.email || '')}</p>
              <span className="inline-block rounded-full bg-[#F4F3F0] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{plan}</span>
            </div>
          </div>

          {plan === 'free' && (
            <Link
              href="/dashboard/settings?upgrade=true"
              className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[#0F0F0E] px-3 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              <ChevronUp size={14} />
              Upgrade to Pro
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-[#F4F3F0] hover:text-[#0F0F0E]"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </aside>

      <div className="fixed bottom-0 left-0 right-0 z-30 flex border-t bg-white md:hidden">
        {[...navItems, upgradeItem].slice(0, 5).map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2 text-[10px] ${
                active ? 'text-[#0F0F0E]' : 'text-muted-foreground'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </div>

      <div className="flex-1 md:ml-[220px]">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-white/80 px-4 py-3 backdrop-blur-md md:px-8">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          {activeStore && (
            <div className="flex items-center gap-3">
              <span className={`inline-block h-2 w-2 rounded-full ${activeStore.status === 'live' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm font-medium">{activeStore.name}</span>
              <a
                href={`http://localhost:3001/${activeStore.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground underline underline-offset-2"
              >
                View store
              </a>
            </div>
          )}
          <div />
        </header>
        <div className="p-4 pb-20 md:p-8">{children}</div>
      </div>

      {activeStore && <ChatBox storeId={activeStore.id} />}
    </div>
  )
}
