import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@nudge/db'
import * as dns from 'dns/promises'

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

    const { data: store } = await db.from('stores').select('*').eq('id', params.id).eq('owner_id', user.id).single()
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

    const { data: domainRecord } = await db.from('store_domains').select('*').eq('store_id', params.id).single()
    if (!domainRecord) return NextResponse.json({ error: 'No domain configured' }, { status: 404 })

    try {
      const records = await dns.resolveCname(`www.${domainRecord.domain}`)
      const expectedCname = 'cname.vercel-dns.com'

      if (records.some((r) => r === expectedCname || r.endsWith('.vercel-dns.com'))) {
        await db.from('store_domains').update({ verified: true }).eq('id', domainRecord.id)

        const vercelToken = process.env.VERCEL_TOKEN
        if (vercelToken && domainRecord.vercel_domain_id) {
          try {
            await fetch(`https://api.vercel.com/v6/domains/${domainRecord.domain}/config`, {
              headers: { Authorization: `Bearer ${vercelToken}` },
            })
          } catch {}
        }

        return NextResponse.json({ verified: true, domain: domainRecord.domain })
      }
    } catch {}

    return NextResponse.json({ verified: false, domain: domainRecord.domain, message: 'DNS not propagated yet. Ensure a CNAME record for www points to cname.vercel-dns.com' })
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
