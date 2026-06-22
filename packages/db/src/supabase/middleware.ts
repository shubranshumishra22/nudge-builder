import { createServerClient } from '@supabase/ssr'
import type { Database } from '../types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export interface CookieMethods {
  get?(name: string): string | null | undefined | Promise<string | null | undefined>
  set?(name: string, value: string, options: Record<string, unknown>): void | Promise<void>
  remove?(name: string, options: Record<string, unknown>): void | Promise<void>
}

export function createMiddlewareSupabaseClient(cookies: CookieMethods) {
  return createServerClient(supabaseUrl, supabaseAnonKey, { cookies })
}
