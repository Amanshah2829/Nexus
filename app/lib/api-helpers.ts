import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { AppError, ValidationError, NotFoundError, AuthenticationError, AuthorizationError } from './errors';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * Format a successful API response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Format an error API response
 */
export function errorResponse(
  error: Error | AppError,
  status: number = 500
): NextResponse<ApiResponse> {
  const code = error instanceof AppError ? error.code : 'INTERNAL_SERVER_ERROR';
  const message = error.message;
  const details = error instanceof AppError ? error.details : undefined;

  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Validate request body against a Zod schema
 */
export async function validateBody<T>(
  req: NextRequest,
  schema: ZodSchema
): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error: any) {
    throw new ValidationError('Invalid request body', error.errors || error.message);
  }
}

/**
 * Get user session from request
 */
export async function getSessionUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);
  // TODO: Verify JWT token and return user
  // This is a placeholder - implement actual JWT verification
  return { id: 'user-id', email: 'user@example.com' };
}

/**
 * Require a specific role
 */
export function requireRole(userRole: string, requiredRole: string) {
  if (userRole !== requiredRole) {
    throw new AuthorizationError('Insufficient permissions for this operation');
  }
}

/**
 * Rate limiting helper
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 20,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count < limit) {
    record.count++;
    return true;
  }

  return false;
}

/**
 * Handle async route handlers with error catching
 */
export function createHandler<T = any>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>
) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      console.error('[API Error]', error);
      
      if (error instanceof AppError) {
        const statusMap: Record<string, number> = {
          VALIDATION_ERROR: 400,
          NOT_FOUND: 404,
          UNAUTHORIZED: 401,
          FORBIDDEN: 403,
          CONFLICT: 409,
        };
        return errorResponse(error, statusMap[error.code] || 500);
      }

      if (error instanceof SyntaxError) {
        return errorResponse(
          new ValidationError('Invalid JSON in request body'),
          400
        );
      }

      return errorResponse(
        new Error('Internal server error'),
        500
      );
    }
  };
}
