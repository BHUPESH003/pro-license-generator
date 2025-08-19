import { NextRequest } from "next/server";
import { withAdminAuth, AdminAuthError } from "./adminAuth";
import {
  withRateLimit,
  adminGeneralLimiter,
  adminMutationLimiter,
  adminExportLimiter,
} from "./rateLimiter";
import { withCSRFProtection } from "./csrfProtection";
import { withInputValidation, ValidationSchema } from "./inputValidation";
import {
  withSecurityMonitoring,
  recordRateLimitExceeded,
  recordCSRFViolation,
  recordInvalidToken,
} from "./securityMonitoring";

export interface SecurityConfig {
  requireAuth?: boolean;
  requireCSRF?: boolean;
  rateLimit?: "general" | "mutation" | "export" | "none";
  inputValidation?: {
    body?: ValidationSchema;
    query?: ValidationSchema;
  };
  monitoring?: boolean;
}

/**
 * Comprehensive security middleware that combines all security features
 */
export function withSecurity(
  config: SecurityConfig,
  handler: (req: NextRequest, ...args: any[]) => Promise<Response>
) {
  let securedHandler = handler;

  // Apply security monitoring (outermost layer)
  if (config.monitoring !== false) {
    securedHandler = withSecurityMonitoring(securedHandler);
  }

  // Apply input validation
  if (config.inputValidation) {
    securedHandler = withInputValidation(
      config.inputValidation.body,
      config.inputValidation.query
    )(securedHandler);
  }

  // Apply CSRF protection for state-changing operations
  if (config.requireCSRF) {
    const originalHandler = securedHandler;
    securedHandler = async (req: NextRequest, ...args: any[]) => {
      try {
        return await withCSRFProtection(originalHandler)(req, ...args);
      } catch (error) {
        // Record CSRF violation
        const authHeader = req.headers.get("authorization");
        const token = authHeader?.replace(/^Bearer\s+/i, "");
        await recordCSRFViolation(req, token);
        throw error;
      }
    };
  }

  // Apply rate limiting
  if (config.rateLimit && config.rateLimit !== "none") {
    let limiter;
    switch (config.rateLimit) {
      case "mutation":
        limiter = adminMutationLimiter;
        break;
      case "export":
        limiter = adminExportLimiter;
        break;
      default:
        limiter = adminGeneralLimiter;
    }

    const originalHandler = securedHandler;
    securedHandler = async (req: NextRequest, ...args: any[]) => {
      try {
        return await withRateLimit(limiter, originalHandler)(req, ...args);
      } catch (error) {
        // Record rate limit exceeded
        const authHeader = req.headers.get("authorization");
        const token = authHeader?.replace(/^Bearer\s+/i, "");
        await recordRateLimitExceeded(req, token);
        throw error;
      }
    };
  }

  // Apply admin authentication (innermost layer for API logic)
  if (config.requireAuth !== false) {
    const originalHandler = securedHandler;
    securedHandler = async (req: NextRequest, ...args: any[]) => {
      try {
        return await withAdminAuth(originalHandler)(req, ...args);
      } catch (error) {
        // Record authentication failures
        if (error instanceof AdminAuthError) {
          await recordInvalidToken(req, error.message);
        }
        throw error;
      }
    };
  }

  return securedHandler;
}

/**
 * Pre-configured security middleware for common admin operations
 */
export const adminSecurityConfigs = {
  // Read operations (GET requests)
  read: {
    requireAuth: true,
    requireCSRF: false,
    rateLimit: "general" as const,
    monitoring: true,
  },

  // Create/Update/Delete operations
  mutation: {
    requireAuth: true,
    requireCSRF: true,
    rateLimit: "mutation" as const,
    monitoring: true,
  },

  // Export operations
  export: {
    requireAuth: true,
    requireCSRF: false,
    rateLimit: "export" as const,
    monitoring: true,
  },

  // Authentication endpoints
  auth: {
    requireAuth: false,
    requireCSRF: false,
    rateLimit: "general" as const,
    monitoring: true,
  },
} as const;

/**
 * Convenience functions for common security patterns
 */
export function withAdminReadSecurity(
  handler: (req: NextRequest, ...args: any[]) => Promise<Response>,
  inputValidation?: { query?: ValidationSchema }
) {
  return withSecurity(
    {
      ...adminSecurityConfigs.read,
      inputValidation,
    },
    handler
  );
}

export function withAdminMutationSecurity(
  handler: (req: NextRequest, ...args: any[]) => Promise<Response>,
  inputValidation?: { body?: ValidationSchema; query?: ValidationSchema }
) {
  return withSecurity(
    {
      ...adminSecurityConfigs.mutation,
      inputValidation,
    },
    handler
  );
}

export function withAdminExportSecurity(
  handler: (req: NextRequest, ...args: any[]) => Promise<Response>,
  inputValidation?: { query?: ValidationSchema }
) {
  return withSecurity(
    {
      ...adminSecurityConfigs.export,
      inputValidation,
    },
    handler
  );
}

/**
 * Security headers middleware
 */
export function addSecurityHeaders(response: Response): Response {
  // Clone the response to modify headers
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });

  // Add security headers
  newResponse.headers.set("X-Content-Type-Options", "nosniff");
  newResponse.headers.set("X-Frame-Options", "DENY");
  newResponse.headers.set("X-XSS-Protection", "1; mode=block");
  newResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  newResponse.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Content Security Policy for admin panel
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline and unsafe-eval
    "style-src 'self' 'unsafe-inline'", // Allow inline styles for CSS-in-JS
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  newResponse.headers.set("Content-Security-Policy", csp);

  return newResponse;
}

/**
 * Wrapper to add security headers to any response
 */
export function withSecurityHeaders(
  handler: (req: NextRequest, ...args: any[]) => Promise<Response>
) {
  return async (req: NextRequest, ...args: any[]): Promise<Response> => {
    const response = await handler(req, ...args);
    return addSecurityHeaders(response);
  };
}

export default withSecurity;
