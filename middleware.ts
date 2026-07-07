import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Public routes - no auth required
  const publicRoutes = ['/login', '/', '/health', '/api/health', '/api/migrate']
  
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Check if there's a session cookie
  const sessionCookie = request.cookies.get('sb-auth-token')
  
  if (!sessionCookie) {
    // Redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/contacts/:path*',
    '/signals/:path*',
    '/campaigns/:path*',
    '/clusters/:path*',
    '/programs/:path*',
    '/strategy/:path*',
    '/settings/:path*',
  ],
}