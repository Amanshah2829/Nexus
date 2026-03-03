/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  const sanitized = email.trim().toLowerCase();
  
  // Basic email validation and sanitization
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    return '';
  }

  return sanitized;
}

/**
 * Sanitize phone number (keep only digits and common separators)
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d\-\s\+\(\)]/g, '').trim();
}

/**
 * Sanitize file name to prevent directory traversal and XSS
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/\.\./g, '') // Remove directory traversal
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
    .replace(/^\./, '') // Remove leading dots
    .trim()
    .substring(0, 255); // Limit length
}

/**
 * Sanitize URL to prevent XSS
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }

    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize HTML content (remove potentially dangerous tags and attributes)
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') {
    return '';
  }

  // Remove dangerous tags
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*>/gi, '')
    .replace(/<link\b[^<]*>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove on* event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*"[^"]*"/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*'[^']*'/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/href\s*=\s*"javascript:[^"]*"/gi, '');
  sanitized = sanitized.replace(/href\s*=\s*'javascript:[^']*'/gi, '');
  sanitized = sanitized.replace(/src\s*=\s*"javascript:[^"]*"/gi, '');
  sanitized = sanitized.replace(/src\s*=\s*'javascript:[^']*'/gi, '');

  return sanitized;
}

/**
 * Sanitize object properties recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        sanitized[key] = value.map(item =>
          typeof item === 'string' ? sanitizeString(item) : item
        );
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Validate and sanitize query parameters
 */
export function sanitizeQueryParams(params: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(params)) {
    // Sanitize key
    const cleanKey = sanitizeString(key).substring(0, 100);

    // Sanitize value
    if (typeof value === 'string') {
      sanitized[cleanKey] = sanitizeString(value).substring(0, 1000);
    } else if (typeof value === 'number') {
      sanitized[cleanKey] = value;
    } else if (typeof value === 'boolean') {
      sanitized[cleanKey] = value;
    } else if (Array.isArray(value)) {
      sanitized[cleanKey] = value.map(v =>
        typeof v === 'string' ? sanitizeString(v) : v
      ).slice(0, 100);
    }
  }

  return sanitized;
}
