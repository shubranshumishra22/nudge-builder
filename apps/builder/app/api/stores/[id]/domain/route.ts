import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@nudge/db'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const db = createClient(supabaseUrl, supabaseKey)

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient({ get(name) { return cookieStore.get(name)?.value }, set() {}, remove() {} })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await db.from('profiles').select('plan').eq('id', user.id).single()
    if (!profile || profile.plan === 'free') {
      return NextResponse.json({ error: 'Pro plan required for custom domains' }, { status: 403 })
    }

    const { data: store } = await db.from('stores').select('*').eq('id', params.id).eq('owner_id', user.id).single()
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

    const { domain } = await request.json()
    if (!domain || !/^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 })
    }

    const { data: existing } = await db.from('store_domains').select('id').eq('domain', domain).maybeSingle()
    if (existing) {
      return NextResponse.json({ error: 'Domain already in use' }, { status: 409 })
    }

    const vercelToken = process.env.VERCEL_TOKEN
    const vercelProjectId = process.env.VERCEL_PROJECT_ID

    if (vercelToken && vercelProjectId) {
      const vercelRes = await fetch(`https://api.vercel.com/v9/projects/${vercelProjectId}/domains`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: domain }),
      })
      const vercelData = await vercelRes.json()

      if (!vercelRes.ok) {
        return NextResponse.json({ error: vercelData.error?.message || 'Vercel domain add failed' }, { status: 500 })
      }

      await db.from('store_domains').insert({
        store_id: params.id,
        domain,
        verified: false,
        vercel_domain_id: vercelData.id || vercelData.uid,
      })

      return NextResponse.json({
        domain,
        verification: {
          type: 'CNAME',
          name: 'www',
          value: 'cname.vercel-dns.com',
        },
        vercelData,
      })
    }

    await db.from('store_domains').insert({
      store_id: params.id,
      domain,
      verified: false,
    })

    return NextResponse.json({
      domain,
      verification: {
        type: 'CNAME',
        name: 'www',
        value: 'cname.vercel-dns.com',
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
