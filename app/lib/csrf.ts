import crypto from 'crypto';
import { NextRequest } from 'next/server';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_TOKEN_COOKIE = 'csrf-token';

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Hash CSRF token for storage
 */
export function hashCsrfToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

/**
 * Verify CSRF token
 * Compares the token from request header with the one in cookie
 */
export function verifyCsrfToken(request: NextRequest, token: string): boolean {
  const cookieToken = request.cookies.get(CSRF_TOKEN_COOKIE)?.value;

  if (!cookieToken || !token) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(token)
    );
  } catch {
    return false;
  }
}

/**
 * Methods that require CSRF protection
 */
const CSRF_REQUIRED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Check if request method requires CSRF protection
 */
export function requiresCsrfProtection(method: string): boolean {
  return CSRF_REQUIRED_METHODS.includes(method.toUpperCase());
}

/**
 * Validate CSRF token in request
 */
export function validateCsrfToken(request: NextRequest): boolean {
  const method = request.method.toUpperCase();

  // Only protect state-changing requests
  if (!requiresCsrfProtection(method)) {
    return true;
  }

  // Get token from header
  const token = request.headers.get(CSRF_TOKEN_HEADER);

  if (!token) {
    return false;
  }

  return verifyCsrfToken(request, token);
}

/**
 * Extract CSRF token from request
 */
export function getCsrfToken(request: NextRequest): string | null {
  return request.headers.get(CSRF_TOKEN_HEADER);
}

/**
 * Exempted routes that don't need CSRF protection
 */
export const CSRF_EXEMPTED_ROUTES = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/health',
  '/api/metrics',
  // Add webhook routes here if needed
  '/api/webhooks',
];

/**
 * Check if route is exempted from CSRF protection
 */
export function isRouteExemptedFromCsrf(pathname: string): boolean {
  return CSRF_EXEMPTED_ROUTES.some(route => pathname.startsWith(route));
}
