import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_PATHS = ['/', '/login', '/register', '/search', '/salon', '/pro', '/pro/login', '/pro/register']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Routes client protégées
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/profile') || pathname.startsWith('/booking')) {
    const token = req.cookies.get('bookme_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, req.url))
    }
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
    } catch {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Routes pro protégées
  if (pathname.startsWith('/pro/dashboard') || pathname.startsWith('/pro/planning') || pathname.startsWith('/pro/clients') || pathname.startsWith('/pro/settings')) {
    const token = req.cookies.get('bookme_pro_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/pro/login', req.url))
    }
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
    } catch {
      return NextResponse.redirect(new URL('/pro/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
