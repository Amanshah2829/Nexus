import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './session';
import { validateCsrfToken, isRouteExemptedFromCsrf } from './csrf';
import { checkRateLimit } from './api-helpers';
import { getIpAddress } from './audit';
import { sanitizeQueryParams } from './sanitize';

/**
 * Security middleware for API routes
 * Implements: CSRF protection, rate limiting, input sanitization, CORS
 */
export async function securityMiddleware(
  request: NextRequest,
  options?: {
    requireAuth?: boolean;
    allowedOrigins?: string[];
    rateLimit?: { requests: number; windowMs: number };
    skipCsrf?: boolean;
  }
) {
  // 1. CORS Check
  if (options?.allowedOrigins) {
    const origin = request.headers.get('origin');
    
    if (origin && !options.allowedOrigins.includes(origin) && !options.allowedOrigins.includes('*')) {
      return NextResponse.json(
        { message: 'CORS policy violation' },
        { status: 403 }
      );
    }
  }

  // 2. Check method
  const method = request.method.toUpperCase();

  // 3. Rate limiting
  const ipAddress = getIpAddress(request);
  const pathname = new URL(request.url).pathname;
  const rateLimitKey = `${ipAddress}:${method}:${pathname}`;
  
  const limit = options?.rateLimit || { requests: 100, windowMs: 60000 };
  if (!checkRateLimit(rateLimitKey, limit.requests, limit.windowMs)) {
    return NextResponse.json(
      { message: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  // 4. CSRF Protection
  if (!options?.skipCsrf && !isRouteExemptedFromCsrf(pathname)) {
    if (!validateCsrfToken(request)) {
      return NextResponse.json(
        { message: 'CSRF token validation failed' },
        { status: 403 }
      );
    }
  }

  // 5. Authentication check
  if (options?.requireAuth !== false) {
    const session = await getSession(request);
    
    if (!session && !isRouteExemptedFromCsrf(pathname)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  // 6. Sanitize query parameters
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);
  if (Object.keys(params).length > 0) {
    const sanitized = sanitizeQueryParams(params);
    
    // Update URL with sanitized params
    const newUrl = new URL(request.url);
    Object.keys(sanitized).forEach(key => {
      newUrl.searchParams.set(key, String(sanitized[key]));
    });
  }

  // Return null to indicate all checks passed
  return null;
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=()'
  );

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-ancestors 'none';"
  );

  // Strict Transport Security (HTTPS only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

/**
 * Wrap an API handler with security middleware
 */
export function withSecurity(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: {
    requireAuth?: boolean;
    allowedOrigins?: string[];
    rateLimit?: { requests: number; windowMs: number };
    skipCsrf?: boolean;
  }
) {
  return async (req: NextRequest) => {
    // Run security middleware
    const securityError = await securityMiddleware(req, options);
    if (securityError) {
      return securityError;
    }

    // Call the actual handler
    let response = await handler(req);

    // Add security headers
    response = addSecurityHeaders(response);

    return response;
  };
}
