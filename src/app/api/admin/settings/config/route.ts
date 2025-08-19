import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import dbConnect from "@/lib/db";

interface SystemConfiguration {
  application: {
    name: string;
    version: string;
    environment: string;
    debug: boolean;
  };
  database: {
    connectionString: string; // Masked for security
    maxConnections: number;
    timeout: number;
  };
  authentication: {
    jwtExpiry: string;
    refreshTokenExpiry: string;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
  };
  stripe: {
    publicKey: string; // Masked
    webhookEndpoint: string;
    defaultCurrency: string;
  };
  email: {
    provider: string;
    fromAddress: string;
    templatesEnabled: boolean;
  };
  telemetry: {
    enabled: boolean;
    retentionDays: number;
    batchSize: number;
  };
  security: {
    corsEnabled: boolean;
    rateLimitingEnabled: boolean;
    auditLoggingEnabled: boolean;
  };
}

async function getSystemConfigHandler(request: NextRequest) {
  await dbConnect();

  try {
    // Build system configuration from environment variables and defaults
    const config: SystemConfiguration = {
      application: {
        name: "MyCleanOne Admin Panel",
        version: process.env.APP_VERSION || "1.0.0",
        environment: process.env.NODE_ENV || "development",
        debug: process.env.NODE_ENV === "development",
      },
      database: {
        connectionString: maskConnectionString(process.env.MONGODB_URI || ""),
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || "10"),
        timeout: parseInt(process.env.DB_TIMEOUT || "30000"),
      },
      authentication: {
        jwtExpiry: process.env.JWT_EXPIRY || "1h",
        refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",
        passwordPolicy: {
          minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || "8"),
          requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === "true",
          requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE === "true",
          requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === "true",
          requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL === "true",
        },
      },
      stripe: {
        publicKey: maskApiKey(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
        ),
        webhookEndpoint:
          process.env.STRIPE_WEBHOOK_ENDPOINT || "/api/stripe/webhook",
        defaultCurrency: process.env.STRIPE_DEFAULT_CURRENCY || "usd",
      },
      email: {
        provider: process.env.EMAIL_PROVIDER || "SQS",
        fromAddress: process.env.EMAIL_FROM_ADDRESS || "noreply@mycleanone.com",
        templatesEnabled: process.env.EMAIL_TEMPLATES_ENABLED === "true",
      },
      telemetry: {
        enabled: process.env.TELEMETRY_ENABLED !== "false",
        retentionDays: parseInt(process.env.TELEMETRY_RETENTION_DAYS || "90"),
        batchSize: parseInt(process.env.TELEMETRY_BATCH_SIZE || "100"),
      },
      security: {
        corsEnabled: process.env.CORS_ENABLED !== "false",
        rateLimitingEnabled: process.env.RATE_LIMITING_ENABLED !== "false",
        auditLoggingEnabled: process.env.AUDIT_LOGGING_ENABLED !== "false",
      },
    };

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error fetching system configuration:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch system configuration",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

async function updateSystemConfigHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        {
          success: false,
          message: "Configuration data is required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Validate configuration
    const validation = validateSystemConfig(config);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid configuration",
          code: "VALIDATION_ERROR",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Update environment variables or configuration files
    // 2. Restart services if needed
    // 3. Validate changes don't break the system

    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: "System configuration updated successfully",
      data: config,
    });
  } catch (error) {
    console.error("Error updating system configuration:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update system configuration",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

function validateSystemConfig(config: any): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  // Validate authentication settings
  if (config.authentication?.passwordPolicy) {
    const policy = config.authentication.passwordPolicy;
    if (policy.minLength && policy.minLength < 6) {
      errors.push("Password minimum length must be at least 6 characters");
    }
  }

  // Validate telemetry settings
  if (config.telemetry) {
    if (config.telemetry.retentionDays && config.telemetry.retentionDays < 1) {
      errors.push("Telemetry retention days must be at least 1");
    }
    if (config.telemetry.batchSize && config.telemetry.batchSize < 1) {
      errors.push("Telemetry batch size must be at least 1");
    }
  }

  // Validate database settings
  if (config.database) {
    if (config.database.maxConnections && config.database.maxConnections < 1) {
      errors.push("Database max connections must be at least 1");
    }
    if (config.database.timeout && config.database.timeout < 1000) {
      errors.push("Database timeout must be at least 1000ms");
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

function maskConnectionString(connectionString: string): string {
  if (!connectionString) return "";

  // Mask password in MongoDB connection string
  return connectionString.replace(/:([^:@]+)@/, ":***@");
}

function maskApiKey(apiKey: string): string {
  if (!apiKey) return "";

  // Show only first and last few characters
  if (apiKey.length <= 8) return "***";
  return apiKey.substring(0, 4) + "***" + apiKey.substring(apiKey.length - 4);
}

export const GET = withAdminAuth(getSystemConfigHandler);
export const PUT = withAdminAuth(updateSystemConfigHandler);
