import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname;

  // Paths that are always public
  const isPublicRoute = path.startsWith('/login') || path.startsWith('/auth') || path.startsWith('/_next') || path.includes('.')

  // 1. If not logged in and not on a public route, redirect to /login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. If logged in, handle role-based redirection
  if (user) {
    // Fetch profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // Redirect away from login if already authenticated
    if (path === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'MANAGER' ? '/admin/dash' : '/'
      return NextResponse.redirect(url)
    }

    // Role-based route protection
    if (path.startsWith('/admin') && role !== 'MANAGER') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // Redirect Manager from root to dashboard
    if (path === '/' && role === 'MANAGER') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/dash'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
