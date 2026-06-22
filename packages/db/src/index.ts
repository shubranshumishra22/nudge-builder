import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export type { Database, Tables, Enums } from './types'
export type {
  Json,
  PlanType,
  BusinessType,
  StoreStatus,
  FontStyle,
  StockStatus,
  PaymentMethod,
  OrderStatus,
  PaymentStatus,
  SubscriptionStatus,
} from './types'
export type {
  ProfilesTable,
  StoresTable,
  StoreThemesTable,
  StoreDomainsTable,
  ProductsTable,
  ProductImagesTable,
  OrdersTable,
  OrderItemsTable,
  PaymentsTable,
  SubscriptionsTable,
  AiGenerationLogsTable,
} from './types'

export { createServerSupabaseClient } from './supabase/server'
export { createBrowserSupabaseClient } from './supabase/client'
export { createMiddlewareSupabaseClient } from './supabase/middleware'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export function createClientSupabaseClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

