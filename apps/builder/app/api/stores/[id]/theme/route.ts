import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { error } = await supabase.from('store_themes').update(body).eq('store_id', params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await supabase.from('order_items').delete().eq('order_id', params.id)
    await supabase.from('orders').delete().eq('store_id', params.id)
    await supabase.from('products').delete().eq('store_id', params.id)
    await supabase.from('store_themes').delete().eq('store_id', params.id)
    await supabase.from('store_domains').delete().eq('store_id', params.id)
    await supabase.from('stores').delete().eq('id', params.id)
    return NextResponse.json({ success: true })
  } catch (err) { return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}
