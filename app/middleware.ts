import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'];
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes - check for session
  const sessionCookie = request.cookies.get('session');
  
  if (!sessionCookie) {
    // Redirect to login if no session
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Add security headers
  const response = NextResponse.next();
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-ancestors 'none';"
  );
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );
  
  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
