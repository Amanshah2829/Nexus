import crypto from 'crypto';

/**
 * Hash a password using PBKDF2 (Node.js built-in, no dependencies)
 * In production, consider using bcrypt npm package instead
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      
      const hash = derivedKey.toString('hex');
      // Store both salt and hash together
      resolve(`${salt}:${hash}`);
    });
  });
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, hash] = storedHash.split(':');
    
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      
      const newHash = derivedKey.toString('hex');
      // Constant-time comparison to prevent timing attacks
      resolve(crypto.timingSafeEqual(
        Buffer.from(hash),
        Buffer.from(newHash)
      ));
    });
  });
}

/**
 * Validate password strength
 * Returns { valid: boolean, errors: string[] }
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a secure random token for password reset, email verification, etc.
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a token (for storage in database)
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
