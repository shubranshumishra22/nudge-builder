import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@nudge/db'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const db = createClient(supabaseUrl, supabaseKey)

export default async function SettingsPage() {
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient({ get(name) { return cookieStore.get(name)?.value }, set() {}, remove() {} })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: stores } = await db.from('stores').select('*').eq('owner_id', user.id)
  const store = stores?.[0]
  if (!store) redirect('/dashboard')

  const { data: owner } = await db.from('profiles').select('*').eq('id', user.id).single()

  return <SettingsClient store={store} owner={owner} />
}
