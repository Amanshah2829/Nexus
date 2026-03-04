/**
 * Comprehensive error handling
 * Logs errors securely without exposing sensitive data
 */

export enum ErrorLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface ErrorLog {
  level: ErrorLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  stack?: string;
  userId?: string;
  tenantId?: string;
}

class ErrorHandler {
  private logs: ErrorLog[] = [];

  /**
   * Log error with context
   */
  public log(
    message: string,
    level: ErrorLevel = ErrorLevel.ERROR,
    context?: Record<string, any>,
    error?: Error
  ): void {
    const errorLog: ErrorLog = {
      level,
      message,
      timestamp: new Date(),
      context: this.sanitizeContext(context),
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    };

    this.logs.push(errorLog);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `[${errorLog.level.toUpperCase()}] ${message}`,
        context,
        error
      );
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production' && level === ErrorLevel.CRITICAL) {
      this.sendToMonitoring(errorLog);
    }
  }

  /**
   * Sanitize context to remove sensitive data
   */
  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;

    const sanitized = { ...context };
    const sensitiveKeys = [
      'password',
      'token',
      'apiKey',
      'secret',
      'authorization',
      'creditCard',
    ];

    sensitiveKeys.forEach((key) => {
      if (key in sanitized) {
        sanitized[key] = '***REDACTED***';
      }
    });

    return sanitized;
  }

  /**
   * Send critical errors to monitoring service
   */
  private sendToMonitoring(errorLog: ErrorLog): void {
    // TODO: Integrate with Sentry, LogRocket, or similar
    // This is a placeholder for monitoring service integration
  }

  /**
   * Get logs filtered by level
   */
  public getLogs(level?: ErrorLevel): ErrorLog[] {
    if (!level) return this.logs;
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Clear logs
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Handle API errors
   */
  public handleApiError(error: any, context?: string): {
    status: number;
    message: string;
  } {
    this.log(`API Error: ${context || 'Unknown'}`, ErrorLevel.ERROR, { error });

    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data?.message || 'An error occurred',
      };
    }

    if (error.message === 'Network Error') {
      return {
        status: 500,
        message: 'Network error. Please check your connection.',
      };
    }

    return {
      status: 500,
      message: 'An unexpected error occurred',
    };
  }

  /**
   * Handle validation errors
   */
  public handleValidationError(error: any): {
    fields: Record<string, string[]>;
    message: string;
  } {
    this.log('Validation Error', ErrorLevel.WARNING);

    const fields: Record<string, string[]> = {};

    if (error.errors && Array.isArray(error.errors)) {
      error.errors.forEach((err: any) => {
        const path = err.path.join('.');
        if (!fields[path]) {
          fields[path] = [];
        }
        fields[path].push(err.message);
      });
    }

    return {
      fields,
      message: 'Validation failed',
    };
  }

  /**
   * Handle database errors
   */
  public handleDatabaseError(error: any): {
    status: number;
    message: string;
  } {
    this.log('Database Error', ErrorLevel.CRITICAL, {}, error);

    if (error.code === 11000) {
      return {
        status: 400,
        message: 'Duplicate entry',
      };
    }

    if (error.name === 'ValidationError') {
      return {
        status: 400,
        message: 'Invalid data',
      };
    }

    return {
      status: 500,
      message: 'Database error occurred',
    };
  }
}

export const errorHandler = new ErrorHandler();
