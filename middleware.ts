import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth disabled during development - all routes public
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: []
}
