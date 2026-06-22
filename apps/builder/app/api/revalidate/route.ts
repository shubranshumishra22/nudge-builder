import { NextResponse } from 'next/server'

const storefrontUrl = process.env.STOREFRONT_URL || 'http://localhost:3001'

export async function POST(request: Request) {
  try {
    const { slug } = await request.json()
    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

    try {
      await fetch(`${storefrontUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
    } catch {}

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}
