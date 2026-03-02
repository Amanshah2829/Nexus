// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@/app/lib/session';

async function isSignupEnabled(request: NextRequest) {
    try {
        const host = request.nextUrl.protocol + '//' + request.nextUrl.host;
        const response = await fetch(`${host}/api/settings/signup-enabled`);
        if (!response.ok) {
            return true;
        }
        const data = await response.json();
        return data.value;
    } catch (e) {
        return true;
    }
}

const roleDashboardMap: { [key: string]: string } = {
  'super-admin': '/dashboard',
  'micro-admin': '/dashboard',
  'nano-admin': '/dashboard',
  'admin': '/dashboard',
  'hod': '/approvals',
  'engineer': '/dashboard',
  'viewer': '/dashboard',
  'sales': '/sales',
  'user': '/portal'
};

export async function middleware(request: NextRequest) {
  const session = await getSession(request);
  const { pathname } = request.nextUrl;

  const publicPaths = ['/login', '/signup', '/verify-email'];
  const isPublicPath = publicPaths.some(p => pathname.startsWith(p));
  
  if (pathname.startsWith('/onboarding')) {
      return NextResponse.next();
  }

  if (pathname.startsWith('/signup')) {
    const signupIsEnabled = await isSignupEnabled(request);
    if (!signupIsEnabled) {
      return NextResponse.redirect(new URL('/login?signup=disabled', request.url));
    }
  }

  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && (isPublicPath || pathname === '/')) {
    const dashboardUrl = roleDashboardMap[session.role] || '/dashboard';
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*\\.js).*)',
  ],
};
