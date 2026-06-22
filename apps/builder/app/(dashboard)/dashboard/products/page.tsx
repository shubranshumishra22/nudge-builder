import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@nudge/db'
import { redirect } from 'next/navigation'
import ProductsClient from './ProductsClient'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const db = createClient(supabaseUrl, supabaseKey)

export default async function ProductsPage() {
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient({
    get(name) { return cookieStore.get(name)?.value }, set() {}, remove() {},
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: stores } = await db.from('stores').select('id, slug, name').eq('owner_id', user.id)
  const store = stores?.[0]
  if (!store) redirect('/dashboard')

  const { data: products } = await db
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .order('sort_order')

  const { data: images } = await db
    .from('product_images')
    .select('product_id, url, is_primary')
    .in('product_id', (products || []).map((p) => p.id))

  const imgMap = new Map<string, string>()
  for (const img of images || []) {
    if (!imgMap.has(img.product_id)) imgMap.set(img.product_id, img.url)
  }

  const categories = [...new Set((products || []).map((p) => p.category).filter(Boolean))] as string[]

  return <ProductsClient store={store} products={products || []} categories={categories} imageMap={Object.fromEntries(imgMap)} />
}
