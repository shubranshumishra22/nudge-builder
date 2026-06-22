import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareSupabaseClient } from '@nudge/db/supabase/middleware'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createMiddlewareSupabaseClient({
    get(name: string) {
      return request.cookies.get(name)?.value
    },
    set(name: string, value: string, options: Record<string, unknown>) {
      request.cookies.set({ name, value, ...options })
      response = NextResponse.next({ request: { headers: request.headers } })
      response.cookies.set({ name, value, ...options })
    },
    remove(name: string, options: Record<string, unknown>) {
      request.cookies.set({ name, value: '', ...options })
      response = NextResponse.next({ request: { headers: request.headers } })
      response.cookies.set({ name, value: '', ...options })
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const isAuthPage = pathname.startsWith('/login')
  const isOnboardPage = pathname.startsWith('/onboard')
  const isDashboardPage = pathname.startsWith('/dashboard')

  if (!user) {
    if (isDashboardPage || isOnboardPage) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  const onboardingCompleted = profile?.onboarding_completed ?? false

  if (isAuthPage) {
    if (onboardingCompleted) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/onboard', request.url))
  }

  if (isOnboardPage && onboardingCompleted) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isDashboardPage && !onboardingCompleted) {
    return NextResponse.redirect(new URL('/onboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/login', '/onboard/:path*', '/dashboard/:path*'],
}
