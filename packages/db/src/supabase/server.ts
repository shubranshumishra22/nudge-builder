import { createServerClient, type CookieMethods } from '@supabase/ssr'
import type { Database } from '../types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createServerSupabaseClient(cookies: CookieMethods) {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, { cookies })
}
