import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@nudge/db'
import { redirect } from 'next/navigation'
import DashboardHomeClient from './DashboardHomeClient'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const db = createClient(supabaseUrl, supabaseKey)

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardHome() {
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient({
    get(name) { return cookieStore.get(name)?.value }, set() {}, remove() {},
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: stores } = await db.from('stores').select('*').eq('owner_id', user.id)
  const store = stores?.[0]
  if (!store) return <DashboardHomeClient greeting={getGreeting()} name="" store={null} stats={null} orders={[]} />

  const slug = store.slug

  const { data: orders } = await db
    .from('orders')
    .select('*, order_items(*)')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  const totalOrders = orders?.length || 0
  const thisMonth = new Date()
  thisMonth.setDate(1)
  const revenueThisMonth = orders
    ?.filter((o) => new Date(o.created_at) >= thisMonth && (o.status === 'confirmed' || o.status === 'delivered'))
    .reduce((s, o) => s + o.total, 0) || 0

  const { count: productCount } = await db
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', store.id)

  const recentOrders = (orders || []).slice(0, 5)

  return (
    <DashboardHomeClient
      greeting={getGreeting()}
      name={user.email?.split('@')[0] || ''}
      store={store}
      stats={{ totalOrders, revenueThisMonth, productCount: productCount || 0 }}
      orders={recentOrders}
    />
  )
}
