import { NextRequest } from "next/server";
import { createHash, randomBytes } from "crypto";

interface CSRFConfig {
  secret: string;
  tokenLength: number;
  cookieName: string;
  headerName: string;
  ignoreMethods: string[];
}

export class CSRFError extends Error {
  constructor(
    message: string,
    public code: string = "CSRF_TOKEN_INVALID"
  ) {
    super(message);
    this.name = "CSRFError";
  }
}

class CSRFProtection {
  private config: CSRFConfig;

  constructor(config: Partial<CSRFConfig> = {}) {
    this.config = {
      secret:
        process.env.CSRF_SECRET ||
        process.env.JWT_SECRET ||
        "default-csrf-secret",
      tokenLength: 32,
      cookieName: "csrf-token",
      headerName: "x-csrf-token",
      ignoreMethods: ["GET", "HEAD", "OPTIONS"],
      ...config,
    };
  }

  /**
   * Generate a CSRF token
   */
  generateToken(sessionId?: string): string {
    const randomToken = randomBytes(this.config.tokenLength).toString("hex");
    const hash = createHash("sha256")
      .update(randomToken)
      .update(this.config.secret)
      .update(sessionId || "")
      .digest("hex");

    return `${randomToken}.${hash}`;
  }

  /**
   * Verify a CSRF token
   */
  verifyToken(token: string, sessionId?: string): boolean {
    if (!token || typeof token !== "string") {
      return false;
    }

    const [randomToken, hash] = token.split(".");
    if (!randomToken || !hash) {
      return false;
    }

    const expectedHash = createHash("sha256")
      .update(randomToken)
      .update(this.config.secret)
      .update(sessionId || "")
      .digest("hex");

    return hash === expectedHash;
  }

  /**
   * Extract CSRF token from request
   */
  private extractToken(req: NextRequest): string | null {
    // Try header first
    const headerToken = req.headers.get(this.config.headerName);
    if (headerToken) {
      return headerToken;
    }

    // Try form data for POST requests
    if (req.method === "POST") {
      try {
        const formData = req.formData();
        // Note: This is a simplified approach. In practice, you'd need to handle this differently
        // since formData() consumes the request body
      } catch (error) {
        // Ignore form data parsing errors
      }
    }

    return null;
  }

  /**
   * Get session ID from request (you might want to customize this)
   */
  private getSessionId(req: NextRequest): string {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    return token || "";
  }

  /**
   * Validate CSRF token for the request
   */
  async validateRequest(req: NextRequest): Promise<void> {
    // Skip validation for safe methods
    if (this.config.ignoreMethods.includes(req.method)) {
      return;
    }

    const token = this.extractToken(req);
    if (!token) {
      throw new CSRFError("CSRF token missing", "CSRF_TOKEN_MISSING");
    }

    const sessionId = this.getSessionId(req);
    const isValid = this.verifyToken(token, sessionId);

    if (!isValid) {
      throw new CSRFError("CSRF token invalid", "CSRF_TOKEN_INVALID");
    }
  }
}

// Default CSRF protection instance
export const csrfProtection = new CSRFProtection();

/**
 * CSRF protection middleware wrapper
 */
export function withCSRFProtection(
  handler: (req: NextRequest, ...args: any[]) => Promise<Response>
) {
  return async (req: NextRequest, ...args: any[]): Promise<Response> => {
    try {
      await csrfProtection.validateRequest(req);
      return await handler(req, ...args);
    } catch (error) {
      if (error instanceof CSRFError) {
        return new Response(
          JSON.stringify({
            success: false,
            message: error.message,
            code: error.code,
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      console.error("CSRF protection error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Security validation failed",
          code: "SECURITY_ERROR",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };
}

/**
 * Generate CSRF token endpoint
 */
export async function generateCSRFTokenResponse(
  req: NextRequest
): Promise<Response> {
  const sessionId =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const token = csrfProtection.generateToken(sessionId);

  return new Response(
    JSON.stringify({
      success: true,
      data: { csrfToken: token },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `${csrfProtection["config"].cookieName}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/`,
      },
    }
  );
}

export default CSRFProtection;
