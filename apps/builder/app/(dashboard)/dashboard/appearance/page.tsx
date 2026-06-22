import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@nudge/db'
import { redirect } from 'next/navigation'
import AppearanceClient from './AppearanceClient'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const db = createClient(supabaseUrl, supabaseKey)

export default async function AppearancePage() {
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient({ get(name) { return cookieStore.get(name)?.value }, set() {}, remove() {} })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: stores } = await db.from('stores').select('id, slug').eq('owner_id', user.id)
  const store = stores?.[0]
  if (!store) redirect('/dashboard')

  const { data: theme } = await db.from('store_themes').select('*').eq('store_id', store.id).single()

  return <AppearanceClient store={store} theme={theme} />
}
