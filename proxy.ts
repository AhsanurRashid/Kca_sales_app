import { NextResponse, NextRequest } from 'next/server'

const publicRoutes = ['/']
const protectedRoutes = ['/app', '/products', '/sales-order', '/order-list', '/credit-note', '/credit-note-list', '/payment', '/collection-list', '/location-tracker']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const loggedInUser = request.cookies.get('logged-in-user')?.value
  const isAuthenticated = !!loggedInUser

  // Redirect authenticated users away from public routes (login page)
  if (isAuthenticated && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  // Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/app/:path*', '/products/:path*', '/sales-order/:path*', '/order-list/:path*', '/credit-note/:path*', '/credit-note-list/:path*', '/payment/:path*', '/collection-list/:path*', '/location-tracker/:path*'],
}