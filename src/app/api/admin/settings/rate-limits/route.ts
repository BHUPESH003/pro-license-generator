import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";

interface RateLimitRule {
  id: string;
  endpoint: string;
  method: string;
  requests: number;
  window: string; // e.g., "1m", "1h", "1d"
  enabled: boolean;
  description?: string;
}

interface RateLimitConfig {
  global: {
    enabled: boolean;
    defaultRequests: number;
    defaultWindow: string;
  };
  rules: RateLimitRule[];
}

// Default rate limit configuration
const DEFAULT_RATE_LIMITS: RateLimitConfig = {
  global: {
    enabled: true,
    defaultRequests: 100,
    defaultWindow: "1m",
  },
  rules: [
    {
      id: "auth-login",
      endpoint: "/api/auth/login",
      method: "POST",
      requests: 5,
      window: "15m",
      enabled: true,
      description: "Login attempts per IP",
    },
    {
      id: "auth-register",
      endpoint: "/api/auth/register",
      method: "POST",
      requests: 3,
      window: "1h",
      enabled: true,
      description: "Registration attempts per IP",
    },
    {
      id: "auth-forgot-password",
      endpoint: "/api/auth/forgot-password",
      method: "POST",
      requests: 3,
      window: "1h",
      enabled: true,
      description: "Password reset requests per IP",
    },
    {
      id: "telemetry-events",
      endpoint: "/api/telemetry/events",
      method: "POST",
      requests: 1000,
      window: "1h",
      enabled: true,
      description: "Telemetry events per device",
    },
    {
      id: "licenses-activate",
      endpoint: "/api/licenses/*/activate",
      method: "POST",
      requests: 10,
      window: "1h",
      enabled: true,
      description: "License activation attempts",
    },
    {
      id: "admin-dashboard",
      endpoint: "/api/admin/metrics/*",
      method: "GET",
      requests: 60,
      window: "1m",
      enabled: true,
      description: "Admin dashboard metrics",
    },
    {
      id: "admin-exports",
      endpoint: "/api/admin/*/export",
      method: "GET",
      requests: 5,
      window: "1m",
      enabled: true,
      description: "Data export requests",
    },
  ],
};

async function getRateLimitsHandler(request: NextRequest) {
  try {
    // In a real implementation, this would be fetched from database or Redis
    const rateLimits = DEFAULT_RATE_LIMITS;

    return NextResponse.json({
      success: true,
      data: rateLimits,
    });
  } catch (error) {
    console.error("Error fetching rate limits:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch rate limit configuration",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

async function updateRateLimitsHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        {
          success: false,
          message: "Rate limit configuration is required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Validate configuration
    const validation = validateRateLimitConfig(config);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid rate limit configuration",
          code: "VALIDATION_ERROR",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // In a real implementation, save to database or Redis
    const updatedConfig = {
      ...DEFAULT_RATE_LIMITS,
      ...config,
    };

    return NextResponse.json({
      success: true,
      data: updatedConfig,
      message: "Rate limit configuration updated successfully",
    });
  } catch (error) {
    console.error("Error updating rate limits:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update rate limit configuration",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

function validateRateLimitConfig(config: any): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  // Validate global settings
  if (config.global) {
    if (config.global.defaultRequests && config.global.defaultRequests < 1) {
      errors.push("defaultRequests must be at least 1");
    }
    if (
      config.global.defaultWindow &&
      !isValidTimeWindow(config.global.defaultWindow)
    ) {
      errors.push(
        "defaultWindow must be a valid time format (e.g., '1m', '1h', '1d')"
      );
    }
  }

  // Validate rules
  if (config.rules && Array.isArray(config.rules)) {
    config.rules.forEach((rule: any, index: number) => {
      if (!rule.id) {
        errors.push(`Rule ${index + 1}: id is required`);
      }
      if (!rule.endpoint) {
        errors.push(`Rule ${index + 1}: endpoint is required`);
      }
      if (!rule.method) {
        errors.push(`Rule ${index + 1}: method is required`);
      }
      if (rule.requests && rule.requests < 1) {
        errors.push(`Rule ${index + 1}: requests must be at least 1`);
      }
      if (rule.window && !isValidTimeWindow(rule.window)) {
        errors.push(`Rule ${index + 1}: window must be a valid time format`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

function isValidTimeWindow(window: string): boolean {
  // Check if window matches pattern like "1m", "5m", "1h", "1d"
  const timeWindowRegex = /^\d+[smhd]$/;
  return timeWindowRegex.test(window);
}

export const GET = withAdminAuth(getRateLimitsHandler);
export const PUT = withAdminAuth(updateRateLimitsHandler);
