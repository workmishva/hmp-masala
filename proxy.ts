import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

const PUBLIC_PATHS = ['/', '/products', '/login', '/register']
const ADMIN_PREFIX = '/admin'

export default auth((req) => {
  const session      = req.auth
  const { pathname } = req.nextUrl

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/products/') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/products') ||
    pathname.startsWith('/api/settings')

  if (isPublic) return NextResponse.next()

  if (!session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith(ADMIN_PREFIX) && session.user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.ico$|.*\\.webp$|.*\\.xml$).*)'],
}
