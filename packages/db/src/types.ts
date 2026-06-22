export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type PlanType = 'free' | 'pro' | 'agency'
export type BusinessType = 'cafe' | 'bakery' | 'clothing' | 'fitness' | 'handmade' | 'restaurant' | 'beauty' | 'generic'
export type StoreStatus = 'draft' | 'live' | 'suspended'
export type FontStyle = 'modern' | 'classic' | 'playful' | 'minimal'
export type StockStatus = 'in_stock' | 'out_of_stock' | 'limited'
export type PaymentMethod = 'online' | 'cod'
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'captured' | 'failed' | 'refunded'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due'
export type ChatRole = 'user' | 'assistant'

export interface ProfilesTable {
  Row: {
    id: string
    full_name: string | null
    phone: string | null
    avatar_url: string | null
    plan: PlanType
    plan_expires_at: string | null
    razorpay_customer_id: string | null
    onboarding_completed: boolean
    created_at: string
    updated_at: string
  }
  Insert: {
    id: string
    full_name?: string | null
    phone?: string | null
    avatar_url?: string | null
    plan?: PlanType
    plan_expires_at?: string | null
    razorpay_customer_id?: string | null
    onboarding_completed?: boolean
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    full_name?: string | null
    phone?: string | null
    avatar_url?: string | null
    plan?: PlanType
    plan_expires_at?: string | null
    razorpay_customer_id?: string | null
    onboarding_completed?: boolean
    created_at?: string
    updated_at?: string
  }
}

export interface StoresTable {
  Row: {
    id: string
    owner_id: string
    name: string
    slug: string
    description: string | null
    tagline: string | null
    business_type: BusinessType
    logo_url: string | null
    status: StoreStatus
    template_id: string
    ai_config: Json | null
    whatsapp_number: string | null
    contact_email: string | null
    contact_address: string | null
    currency: string
    delivery_fee: number
    free_delivery_above: number | null
    published_at: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    owner_id: string
    name: string
    slug: string
    description?: string | null
    tagline?: string | null
    business_type: BusinessType
    logo_url?: string | null
    status?: StoreStatus
    template_id?: string
    ai_config?: Json | null
    whatsapp_number?: string | null
    contact_email?: string | null
    contact_address?: string | null
    currency?: string
    delivery_fee?: number
    free_delivery_above?: number | null
    published_at?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    owner_id?: string
    name?: string
    slug?: string
    description?: string | null
    tagline?: string | null
    business_type?: BusinessType
    logo_url?: string | null
    status?: StoreStatus
    template_id?: string
    ai_config?: Json | null
    whatsapp_number?: string | null
    contact_email?: string | null
    contact_address?: string | null
    currency?: string
    delivery_fee?: number
    free_delivery_above?: number | null
    published_at?: string | null
    created_at?: string
    updated_at?: string
  }
}

export interface StoreThemesTable {
  Row: {
    id: string
    store_id: string
    primary_color: string
    accent_color: string
    background_color: string
    font_style: FontStyle
    sections_order: string[] | null
    sections_enabled: Json | null
    hero_image_url: string | null
    hero_headline: string | null
    hero_subheading: string | null
    about_text: string | null
    social_links: Json | null
    custom_css: string | null
    custom_sections: Json | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    store_id: string
    primary_color?: string
    accent_color?: string
    background_color?: string
    font_style?: FontStyle
    sections_order?: string[] | null
    sections_enabled?: Json | null
    hero_image_url?: string | null
    hero_headline?: string | null
    hero_subheading?: string | null
    about_text?: string | null
    social_links?: Json | null
    custom_css?: string | null
    custom_sections?: Json | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    store_id?: string
    primary_color?: string
    accent_color?: string
    background_color?: string
    font_style?: FontStyle
    sections_order?: string[] | null
    sections_enabled?: Json | null
    hero_image_url?: string | null
    hero_headline?: string | null
    hero_subheading?: string | null
    about_text?: string | null
    social_links?: Json | null
    custom_css?: string | null
    custom_sections?: Json | null
    created_at?: string
    updated_at?: string
  }
}

export interface StoreDomainsTable {
  Row: {
    id: string
    store_id: string
    domain: string
    verified: boolean
    vercel_domain_id: string | null
    ssl_provisioned: boolean
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    store_id: string
    domain: string
    verified?: boolean
    vercel_domain_id?: string | null
    ssl_provisioned?: boolean
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    store_id?: string
    domain?: string
    verified?: boolean
    vercel_domain_id?: string | null
    ssl_provisioned?: boolean
    created_at?: string
    updated_at?: string
  }
}

export interface ProductsTable {
  Row: {
    id: string
    store_id: string
    name: string
    slug: string
    description: string | null
    price: number
    compare_at_price: number | null
    category: string | null
    sku: string | null
    stock_status: StockStatus
    stock_quantity: number | null
    is_featured: boolean
    sort_order: number
    seo_title: string | null
    seo_description: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    store_id: string
    name: string
    slug?: string
    description?: string | null
    price: number
    compare_at_price?: number | null
    category?: string | null
    sku?: string | null
    stock_status?: StockStatus
    stock_quantity?: number | null
    is_featured?: boolean
    sort_order?: number
    seo_title?: string | null
    seo_description?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    store_id?: string
    name?: string
    slug?: string
    description?: string | null
    price?: number
    compare_at_price?: number | null
    category?: string | null
    sku?: string | null
    stock_status?: StockStatus
    stock_quantity?: number | null
    is_featured?: boolean
    sort_order?: number
    seo_title?: string | null
    seo_description?: string | null
    created_at?: string
    updated_at?: string
  }
}

export interface ProductImagesTable {
  Row: {
    id: string
    product_id: string
    url: string
    cloudinary_id: string | null
    alt_text: string | null
    sort_order: number
    is_primary: boolean
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    product_id: string
    url: string
    cloudinary_id?: string | null
    alt_text?: string | null
    sort_order?: number
    is_primary?: boolean
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    product_id?: string
    url?: string
    cloudinary_id?: string | null
    alt_text?: string | null
    sort_order?: number
    is_primary?: boolean
    created_at?: string
    updated_at?: string
  }
}

export interface OrdersTable {
  Row: {
    id: string
    order_number: string | null
    store_id: string
    customer_name: string
    customer_phone: string | null
    customer_email: string | null
    delivery_address: Json | null
    subtotal: number
    delivery_fee: number
    discount_amount: number
    total: number
    coupon_code: string | null
    payment_method: PaymentMethod
    status: OrderStatus
    notes: string | null
    owner_notes: string | null
    notified_at: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    order_number?: string | null
    store_id: string
    customer_name: string
    customer_phone?: string | null
    customer_email?: string | null
    delivery_address?: Json | null
    subtotal: number
    delivery_fee?: number
    discount_amount?: number
    total: number
    coupon_code?: string | null
    payment_method?: PaymentMethod
    status?: OrderStatus
    notes?: string | null
    owner_notes?: string | null
    notified_at?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    order_number?: string | null
    store_id?: string
    customer_name?: string
    customer_phone?: string | null
    customer_email?: string | null
    delivery_address?: Json | null
    subtotal?: number
    delivery_fee?: number
    discount_amount?: number
    total?: number
    coupon_code?: string | null
    payment_method?: PaymentMethod
    status?: OrderStatus
    notes?: string | null
    owner_notes?: string | null
    notified_at?: string | null
    created_at?: string
    updated_at?: string
  }
}

export interface OrderItemsTable {
  Row: {
    id: string
    order_id: string
    product_id: string | null
    product_name: string
    product_image: string | null
    unit_price: number
    quantity: number
    total_price: number
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    order_id: string
    product_id?: string | null
    product_name: string
    product_image?: string | null
    unit_price: number
    quantity: number
    total_price: number
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    order_id?: string
    product_id?: string | null
    product_name?: string
    product_image?: string | null
    unit_price?: number
    quantity?: number
    total_price?: number
    created_at?: string
    updated_at?: string
  }
}

export interface PaymentsTable {
  Row: {
    id: string
    order_id: string
    razorpay_order_id: string
    razorpay_payment_id: string | null
    razorpay_signature: string | null
    amount: number
    currency: string
    status: PaymentStatus
    method: string | null
    error_code: string | null
    error_description: string | null
    captured_at: string | null
    refunded_at: string | null
    refund_id: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    order_id: string
    razorpay_order_id: string
    razorpay_payment_id?: string | null
    razorpay_signature?: string | null
    amount: number
    currency?: string
    status?: PaymentStatus
    method?: string | null
    error_code?: string | null
    error_description?: string | null
    captured_at?: string | null
    refunded_at?: string | null
    refund_id?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    order_id?: string
    razorpay_order_id?: string
    razorpay_payment_id?: string | null
    razorpay_signature?: string | null
    amount?: number
    currency?: string
    status?: PaymentStatus
    method?: string | null
    error_code?: string | null
    error_description?: string | null
    captured_at?: string | null
    refunded_at?: string | null
    refund_id?: string | null
    created_at?: string
    updated_at?: string
  }
}

export interface SubscriptionsTable {
  Row: {
    id: string
    owner_id: string
    plan: PlanType
    status: SubscriptionStatus
    razorpay_subscription_id: string
    current_period_start: string
    current_period_end: string
    cancelled_at: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    owner_id: string
    plan: PlanType
    status?: SubscriptionStatus
    razorpay_subscription_id: string
    current_period_start: string
    current_period_end: string
    cancelled_at?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    owner_id?: string
    plan?: PlanType
    status?: SubscriptionStatus
    razorpay_subscription_id?: string
    current_period_start?: string
    current_period_end?: string
    cancelled_at?: string | null
    created_at?: string
    updated_at?: string
  }
}

export interface AiGenerationLogsTable {
  Row: {
    id: string
    owner_id: string | null
    store_id: string | null
    input_payload: Json | null
    output_config: Json | null
    model_used: string | null
    tokens_used: number | null
    duration_ms: number | null
    success: boolean
    error_message: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    owner_id?: string | null
    store_id?: string | null
    input_payload?: Json | null
    output_config?: Json | null
    model_used?: string | null
    tokens_used?: number | null
    duration_ms?: number | null
    success?: boolean
    error_message?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    owner_id?: string | null
    store_id?: string | null
    input_payload?: Json | null
    output_config?: Json | null
    model_used?: string | null
    tokens_used?: number | null
    duration_ms?: number | null
    success?: boolean
    error_message?: string | null
    created_at?: string
    updated_at?: string
  }
}

export interface ChatMessagesTable {
  Row: {
    id: string
    store_id: string
    owner_id: string
    role: ChatRole
    content: string
    metadata: Json | null
    created_at: string
  }
  Insert: {
    id?: string
    store_id: string
    owner_id: string
    role: ChatRole
    content: string
    metadata?: Json | null
    created_at?: string
  }
  Update: {
    id?: string
    store_id?: string
    owner_id?: string
    role?: ChatRole
    content?: string
    metadata?: Json | null
    created_at?: string
  }
}

export interface Database {
  public: {
    Tables: {
      profiles: ProfilesTable
      stores: StoresTable
      store_themes: StoreThemesTable
      store_domains: StoreDomainsTable
      products: ProductsTable
      product_images: ProductImagesTable
      orders: OrdersTable
      order_items: OrderItemsTable
      payments: PaymentsTable
      subscriptions: SubscriptionsTable
      ai_generation_logs: AiGenerationLogsTable
      chat_messages: ChatMessagesTable
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums = never
