# Security Implementation Guide

## Overview

This document outlines all security features implemented in the Nexus platform, including authentication, authorization, input validation, and protection against common attacks.

---

## 1. Authentication & Password Security

### Password Hashing
- **Algorithm**: PBKDF2 with SHA-512 (Node.js native, 100,000 iterations)
- **Salt**: 16-byte random salt per password
- **Location**: `app/lib/password.ts`

```typescript
// Hash a password
const hash = await hashPassword('user-password');

// Verify a password
const isValid = await verifyPassword('user-password', hash);
```

### Password Strength Validation
Enforced requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

```typescript
const result = validatePasswordStrength('MyP@ssw0rd');
// { valid: true, errors: [] }
```

### Login Security

**Failed Login Attempt Tracking**
- Maximum 5 failed attempts allowed
- Account locked for 30 minutes after 5 failed attempts
- IP-based rate limiting: 5 login attempts per minute
- Sanitized email input to prevent injection

**Login API**: `POST /api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "MyP@ssw0rd"
}
```

Features:
- Rate limiting by IP address
- Email validation and sanitization
- Account lock detection
- Audit logging of all login attempts
- Session creation with secure cookies

### Session Management
- **Secure Cookies**: HttpOnly, Secure (HTTPS), SameSite=strict
- **Duration**: Configurable per tenant/role
- **Session Token**: Contains userId, email, role, tenant
- **Auto-invalidation**: On logout or session expiry

---

## 2. Input Validation & Sanitization

### Zod Schema Validation
All endpoints validate input with Zod schemas:
```typescript
import { loginSchema } from '@/app/lib/validation';

const validatedData = loginSchema.parse(body);
```

**Available Schemas** (15+):
- `loginSchema` - Email and password validation
- `complaintCreateSchema` - Complaint validation
- `remoteSessionSchema` - Remote session validation
- And more...

### Input Sanitization

**String Sanitization** - Prevents XSS attacks
```typescript
const safe = sanitizeString('<script>alert("xss")</script>');
// Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
```

**Email Sanitization**
```typescript
const safe = sanitizeEmail('User@Example.COM');
// Returns: 'user@example.com'
```

**File Name Sanitization** - Prevents directory traversal
```typescript
const safe = sanitizeFileName('../../../etc/passwd.txt');
// Returns: 'etc-passwd.txt'
```

**URL Sanitization** - Validates URLs
```typescript
const safe = sanitizeUrl('https://example.com/path');
// Returns: 'https://example.com/path'
```

**HTML Sanitization** - Removes dangerous tags
```typescript
const safe = sanitizeHtml('<script>alert("xss")</script>');
// Returns: ''
```

**Query Parameters Sanitization**
```typescript
const safe = sanitizeQueryParams({ search: '<script>' });
// Returns: { search: '&lt;script&gt;' }
```

---

## 3. Rate Limiting

### Implementation
- **Storage**: In-memory cache with auto-cleanup
- **Key Format**: `{identifier}:{method}:{path}`
- **Limits**: Configurable per endpoint

```typescript
// Check if action is allowed
if (!checkRateLimit(rateLimitKey, 100, 60000)) {
  // Too many requests
}
```

### Default Limits
- **Login attempts**: 5 per minute per IP
- **API calls**: 100 per minute per user
- **File uploads**: 10 per minute per user

### Response Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1234567890
Retry-After: 60
```

---

## 4. CSRF Protection

### Token Generation & Validation
```typescript
import { generateCsrfToken, verifyCsrfToken } from '@/app/lib/csrf';

// Generate token for user
const token = generateCsrfToken();

// Validate token in request
const isValid = verifyCsrfToken(request, token);
```

### Implementation
- **Token Length**: 32 bytes (64 hex characters)
- **Storage**: HTTP-only cookie
- **Transmission**: Request header (`x-csrf-token`)
- **Methods Protected**: POST, PUT, PATCH, DELETE
- **Exempted Routes**:
  - `/api/auth/login`
  - `/api/auth/register`
  - `/api/auth/forgot-password`
  - `/api/auth/reset-password`
  - `/api/auth/verify-email`
  - `/api/health`
  - `/api/metrics`

### Usage in Frontend
```javascript
// Get CSRF token from meta tag or API response
const token = document.querySelector('meta[name="csrf-token"]').content;

// Include in request headers
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'x-csrf-token': token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

---

## 5. Audit Logging

### Implementation
All important actions logged to database with:
- Timestamp
- User ID
- Action type (CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, etc.)
- Resource type
- Resource ID
- Changes made
- Success/failure status
- IP address
- User agent

```typescript
import { logSuccess, logFailure, logSecurityEvent } from '@/app/lib/audit';

// Log successful action
await logSuccess(
  userId,
  'UPDATE',
  'COMPLAINT',
  complaintId,
  { status: 'open' },
  request
);

// Log failed action
await logFailure(
  userId,
  'DELETE',
  'COMPLAINT',
  complaintId,
  'Permission denied',
  request
);

// Log security event
await logSecurityEvent(
  userId,
  'UNAUTHORIZED_ACCESS_ATTEMPT',
  'high',
  'User tried to access restricted resource',
  request
);
```

### AuditLog Model
Located at `app/models/AuditLog.ts`

**Features**:
- Automatic TTL (Time-To-Live) - 90 day retention
- Compound indexes for efficient queries
- Sensitive data masking
- Immutable once created

### Query Audit Logs
```typescript
const logs = await queryAuditLogs({
  userId: 'user123',
  action: 'UPDATE',
  resource: 'COMPLAINT',
  status: 'success',
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  limit: 100,
});
```

---

## 6. Authorization & Access Control

### User Roles
- `user` - Regular user/complainer
- `engineer` - Support engineer
- `admin` - Organization admin
- `super-admin` - System administrator
- `viewer` - Read-only access
- `sales` - Sales role
- `hod` - Head of Department
- And more as needed...

### Role-Based Access Control
```typescript
import { getSession } from '@/app/lib/session';

const session = await getSession(request);

if (session.role !== 'engineer') {
  return NextResponse.json(
    { message: 'Insufficient permissions' },
    { status: 403 }
  );
}
```

### Tenant Isolation
All queries automatically filtered by tenant:
```typescript
const complaints = await Complaint.find({
  tenant: session.tenant, // Automatically isolated
  status: 'open'
});
```

---

## 7. Security Headers

### Implemented Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Applied Via
- `app/middleware.ts` - Global middleware
- `addSecurityHeaders()` - Per-response headers
- `app/lib/security-middleware.ts` - API route protection

---

## 8. Account Lockout & Brute Force Protection

### Implementation
Located in `app/models/User.ts`

**Tracking**:
- `failedLoginAttempts` - Counter (resets on successful login)
- `lastFailedLogin` - Timestamp of last failure
- `isLocked` - Boolean flag
- `lockedUntil` - Expiry time for lock

**Behavior**:
1. First 4 failures - counter increments
2. 5th failure - account locked for 30 minutes
3. Subsequent attempts - rejected with 403 error
4. Successful login - counter reset, lock removed
5. Lock expires - automatically unlocked

```typescript
// Record failed attempt
await user.recordFailedLogin();
// Locks after 5 attempts

// Check if locked
if (user.isAccountLocked()) {
  // Return 403 error
}

// Reset on success
await user.resetLoginAttempts();
```

---

## 9. Token Management

### Password Reset Tokens
- Generated: 32-byte random token
- Hashed: SHA-256 before storage
- Expiry: 1 hour
- Single-use: Consumed on password reset

```typescript
import { generateSecureToken, hashToken } from '@/app/lib/password';

const token = generateSecureToken();
const hashedToken = hashToken(token);

// Store hashedToken in database
// Send plaintext token to user email
```

### Email Verification Tokens
- Similar to password reset tokens
- Expires after email verification
- Single-use

---

## 10. Database Security

### Connection Security
- Connection pooling
- Automatic reconnection on failure
- SSL/TLS support for MongoDB Atlas

```typescript
// app/lib/db.ts
const mongoUri = process.env.MONGODB_URI;
// Ensure it uses mongodb+srv:// with SSL
```

### Query Protection
- MongoDB native prevents SQL injection (uses BSON)
- Parameterized queries throughout
- Input validation before queries

### Sensitive Fields
Some fields excluded from default queries:
```typescript
// Not selected by default
.select('+password +passwordHash +twoFactorSecret')

// Must be explicitly requested
const user = await User.findById(id).select('+password');
```

---

## 11. HTTPS & Encryption

### Transport Security
- **Production**: All connections must be HTTPS
- **Development**: HTTP allowed for localhost
- **HSTS**: Enabled in production (1 year max-age)

### Data Encryption
Email credentials encrypted in database:
```typescript
import { encrypt, decrypt } from '@/app/lib/crypto';

// Encrypt on save
const encryptedPassword = encrypt(emailPassword);

// Decrypt on use
const plainPassword = decrypt(encryptedPassword);
```

---

## 12. Security Middleware

### Comprehensive Protection
```typescript
import { withSecurity } from '@/app/lib/security-middleware';

export const POST = withSecurity(
  async (req) => {
    // Handler code
  },
  {
    requireAuth: true,
    allowedOrigins: ['https://example.com'],
    rateLimit: { requests: 100, windowMs: 60000 },
    skipCsrf: false
  }
);
```

**Protections Applied**:
1. CORS validation
2. Rate limiting
3. CSRF token verification
4. Authentication check
5. Query parameter sanitization
6. Security headers addition

---

## 13. API Error Handling

### Safe Error Messages
Prevents information leakage:
```typescript
// ✓ Good - generic message
return NextResponse.json(
  { message: 'Invalid email or password' },
  { status: 401 }
);

// ✗ Bad - reveals information
return NextResponse.json(
  { message: 'User not found in database' },
  { status: 401 }
);
```

### Error Logging
All errors logged with context:
```typescript
import { logFailure } from '@/app/lib/audit';

try {
  // Operation
} catch (error) {
  await logFailure(userId, 'ACTION', 'RESOURCE', resourceId, error.message, request);
}
```

---

## 14. Checklist for Secure Deployment

- [ ] HTTPS enabled in production
- [ ] Environment variables securely configured
- [ ] Database connection uses SSL/TLS
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] CSRF protection enabled
- [ ] Audit logging to database
- [ ] Security headers configured
- [ ] Password hashing enabled
- [ ] Account lockout enabled
- [ ] Session cookies secure (HttpOnly, Secure, SameSite)
- [ ] Error messages don't leak information
- [ ] Sensitive fields not exposed in API responses
- [ ] Monitoring and alerting active
- [ ] Regular security audits scheduled

---

## 15. Security Best Practices

### For Developers

1. **Always validate input**
   ```typescript
   const validated = schema.parse(input);
   ```

2. **Sanitize before displaying**
   ```typescript
   const safe = sanitizeString(userInput);
   ```

3. **Check authentication & authorization**
   ```typescript
   const session = await getSession(request);
   if (!session || session.role !== 'admin') return 403;
   ```

4. **Log important actions**
   ```typescript
   await logSuccess(userId, 'ACTION', 'RESOURCE', resourceId, changes, request);
   ```

5. **Never hardcode secrets**
   ```typescript
   const apiKey = process.env.API_KEY;
   ```

6. **Use prepared statements**
   - MongoDB: Uses native BSON (safe by default)
   - SQL queries: Always use parameterized queries

7. **Set proper status codes**
   ```typescript
   401 - Unauthorized (no session)
   403 - Forbidden (insufficient permission)
   400 - Bad Request (validation error)
   500 - Internal Error (unexpected)
   ```

### For Operations

1. Monitor audit logs regularly
2. Set up alerts for failed login attempts
3. Monitor rate limit exceeded events
4. Review security events logs
5. Rotate API keys periodically
6. Update dependencies regularly
7. Run security scanning tools
8. Perform penetration testing
9. Backup database regularly
10. Test disaster recovery procedures

---

## Reporting Security Issues

For security vulnerabilities, please contact: security@company.com

Do not post security issues publicly. We take security seriously and will:
1. Acknowledge receipt within 24 hours
2. Investigate and confirm the issue
3. Fix the issue in a security patch
4. Credit you in release notes (if requested)

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Production Ready
