import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@nudge/db'
import { generateStoreConfig } from '@nudge/ai'
import { z } from 'zod'

const generateSchema = z.object({
  name: z.string().min(2).max(60),
  type: z.enum([
    'cafe', 'bakery', 'clothing', 'fitness',
    'handmade', 'restaurant', 'beauty', 'generic',
  ]),
  description: z.string().min(20).max(200),
  colors: z
    .object({
      primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    })
    .optional()
    .default({ primary: '#4F46E5' }),
  products: z
    .array(
      z.object({
        name: z.string().min(1),
        price: z.number().min(0),
        description: z.string().optional(),
      }),
    )
    .max(5)
    .optional()
    .default([]),
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

async function uniqueSlug(db: any, base: string): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const suffix = Math.random().toString(36).slice(2, 6)
    const slug = `${base}-${suffix}`
    const { data } = await db.from('stores').select('id').eq('slug', slug).maybeSingle()
    if (!data) return slug
  }
  return `${base}-${Date.now().toString(36)}`
}

async function checkRateLimit(
  userId: string,
  plan: string,
): Promise<{ allowed: boolean; resetAt: number | null }> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!redisUrl || !redisToken) {
    return { allowed: true, resetAt: null }
  }

  const { Ratelimit } = await import('@upstash/ratelimit')
  const { Redis } = await import('@upstash/redis')

  const limit = plan === 'pro' ? 20 : 3

  const ratelimit = new Ratelimit({
    redis: new Redis({ url: redisUrl, token: redisToken }),
    limiter: Ratelimit.slidingWindow(limit, '1 h'),
    analytics: true,
    prefix: 'nudge:generate',
  })

  const { success, reset } = await ratelimit.limit(userId)
  return { allowed: success, resetAt: reset }
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const cookieStore = cookies()

  const supabase = createServerSupabaseClient({
    get(name: string) {
      return cookieStore.get(name)?.value
    },
    set(name: string, value: string, options: Record<string, unknown>) {
      try { cookieStore.set(name, value, options) } catch {}
    },
    remove(name: string, options: Record<string, unknown>) {
      try { cookieStore.set(name, '', options) } catch {}
    },
  })

  const db = createClient(supabaseUrl, supabaseServiceKey)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await db
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    await db.from('profiles').insert({
      id: user.id,
      full_name: user.email?.split('@')[0] || null,
      plan: 'free',
      onboarding_completed: false,
    })
  }

  const plan = (profile as { plan?: string })?.plan ?? 'free'

  const { allowed, resetAt } = await checkRateLimit(user.id, plan)
  if (!allowed) {
    return NextResponse.json(
      {
        error: 'Generation limit reached',
        resetAt,
      },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(((resetAt ?? Date.now()) - Date.now()) / 1000)) } },
    )
  }

  const body = await request.json()
  const parsed = generateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }

  const { name, type, description, colors, products } = parsed.data

  const baseSlug = slugify(name)
  const slug = await uniqueSlug(db, baseSlug)

  const generationInput = {
    name,
    type,
    description,
    colors: { primary: colors.primary, accent: colors.accent },
    products: products.length > 0 ? products.map((p) => ({ name: p.name, price: p.price, description: p.description })) : undefined,
  }

  const { config, model, tokensUsed, durationMs } = await generateStoreConfig(generationInput)

  const { data: store, error: storeError } = await db
    .from('stores')
    .insert({
      owner_id: user.id,
      name,
      slug,
      description,
      business_type: type,
      ai_config: config as unknown as Record<string, unknown>,
      currency: 'INR',
      delivery_fee: 0,
      status: 'draft',
    })
    .select('id')
    .single()

  if (storeError || !store) {
    return NextResponse.json({ error: storeError?.message ?? 'Failed to create store' }, { status: 500 })
  }

  const { error: themeError } = await db.from('store_themes').insert({
    store_id: store.id,
    primary_color: config.theme.primary_color,
    accent_color: config.theme.accent_color,
    background_color: '#FAFAF8',
    font_style: config.theme.font_style,
    hero_headline: config.business_name,
    hero_subheading: config.tagline,
    sections_order: config.sections,
  })

  if (themeError) {
    console.error('Theme creation failed:', themeError)
  }

  const allProducts =
    products.length > 0
      ? products.map((p) => ({
          name: p.name,
          price: p.price,
          description: p.description ?? '',
          category: type,
        }))
      : config.suggested_products

  for (let i = 0; i < allProducts.length; i++) {
    const sp = allProducts[i]
    const productSlug = slugify(sp.name)

    const { error: productError } = await db.from('products').insert({
      store_id: store.id,
      name: sp.name,
      slug: productSlug,
      description: sp.description,
      price: sp.price,
      category: sp.category || type,
      is_featured: i === 0,
      sort_order: i,
    })

    if (productError) {
      console.error('Product creation failed:', productError)
    }
  }

  await db.from('ai_generation_logs').insert({
    owner_id: user.id,
    store_id: store.id,
    input_payload: parsed.data as unknown as Record<string, unknown>,
    output_config: config as unknown as Record<string, unknown>,
    model_used: model,
    tokens_used: tokensUsed,
    duration_ms: durationMs,
    success: true,
    error_message: null,
  })

  return NextResponse.json({
    storeId: store.id,
    slug,
    config,
  })
}
