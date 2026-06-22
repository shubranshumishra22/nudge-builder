import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { store_id, name, price, compare_at_price, description, category, sku, stock_status, stock_quantity, is_featured } = body

    const { allowed } = await rateLimit(`product-create-${store_id}`, 20, '60 s')
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)

    const { data, error } = await supabase.from('products').insert({
      store_id, name, slug, price, compare_at_price, description, category, sku,
      stock_status: stock_status || 'in_stock', stock_quantity, is_featured: is_featured || false,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ product: data })
  } catch (err) { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, name, price, compare_at_price, description, category, sku, stock_status, stock_quantity, is_featured } = body

    const { allowed } = await rateLimit(`product-update-${id}`, 30, '60 s')
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (price !== undefined) updates.price = price
    if (compare_at_price !== undefined) updates.compare_at_price = compare_at_price
    if (description !== undefined) updates.description = description
    if (category !== undefined) updates.category = category
    if (sku !== undefined) updates.sku = sku
    if (stock_status !== undefined) updates.stock_status = stock_status
    if (stock_quantity !== undefined) updates.stock_quantity = stock_quantity
    if (is_featured !== undefined) updates.is_featured = is_featured

    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ product: data })
  } catch (err) { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    await supabase.from('product_images').delete().eq('product_id', id)
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
