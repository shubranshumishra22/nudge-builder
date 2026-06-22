import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@nudge/db'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const db = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient({
    get(name) { return cookieStore.get(name)?.value },
    set() {},
    remove() {},
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: stores } = await db.from('stores').select('id, slug, name, status').eq('owner_id', user.id)
  return NextResponse.json({ stores })
}
