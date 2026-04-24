import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // If we're missing env vars, we might want to return 500 or just skip middleware
    // But usually for Supabase Auth, it's critical.
    console.error('Missing Supabase variables in middleware')
    return supabaseResponse
  }

  const supabase = createServerClient(
    url,
    key,
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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/invite') || pathname.startsWith('/auth') || pathname.startsWith('/oauth')
  
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    
    // Preserve current path for post-login redirect
    if (pathname !== '/') {
      url.searchParams.set('next', pathname + request.nextUrl.search)
    }
    
    const response = NextResponse.redirect(url)
    
    // Copy cookies to preserve session state
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        maxAge: cookie.maxAge,
        expires: cookie.expires,
        sameSite: cookie.sameSite,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
      })
    })
    
    return response
  }
  
  if (user && (pathname === '/login' || pathname === '/register')) {
    const nextPath = request.nextUrl.searchParams.get('next')
    const url = request.nextUrl.clone()
    url.pathname = nextPath || '/'
    // If nextPath had its own search params, clone() would have kept them,
    // but the search property of the current URL also includes ?next=...
    // To be safe, if we use nextPath, we might want to clear existing params
    if (nextPath) {
      url.search = '' // Clear ?next= and any other login-page params
      // However, if we want to preserve the target's original params, we'd need to parse nextPath
      try {
         const decodedNext = decodeURIComponent(nextPath)
         if (decodedNext.includes('?')) {
            const [path, query] = decodedNext.split('?')
            url.pathname = path
            url.search = query
         } else {
            url.pathname = decodedNext
            url.search = ''
         }
      } catch (e) {
         url.pathname = '/'
      }
    } else {
      url.search = ''
    }

    const response = NextResponse.redirect(url)
    
    // Copy cookies to preserve session state
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        maxAge: cookie.maxAge,
        expires: cookie.expires,
        sameSite: cookie.sameSite,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
      })
    })
    
    return response
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
