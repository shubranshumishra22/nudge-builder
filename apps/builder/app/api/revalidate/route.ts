import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { slug } = await request.json()
    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

    const { revalidatePath } = await import('next/cache')
    const { revalidateTag } = await import('next/cache')
    
    revalidatePath(`http://localhost:3001/${slug}`)
    revalidatePath(`http://localhost:3001/${slug}/products`)
    revalidatePath(`http://localhost:3001/${slug}/checkout`)

    try {
      await fetch(`http://localhost:3001/api/revalidate`, {
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
