import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/auth/login", "/auth/register"]
  
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // For now, allow all dashboard routes - we'll handle auth in pages
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
