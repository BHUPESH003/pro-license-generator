import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import TelemetryEvent from "@/models/TelemetryEvent";
import stripe from "@/lib/stripe";

interface SystemSettings {
  general: {
    systemName: string;
    maintenanceMode: boolean;
    maxUsersPerLicense: number;
    defaultLicenseExpiry: number; // days
  };
  security: {
    sessionTimeout: number; // minutes
    maxLoginAttempts: number;
    passwordMinLength: number;
    requirePasswordChange: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    webhookNotifications: boolean;
    adminAlerts: boolean;
  };
  features: {
    telemetryEnabled: boolean;
    auditLogging: boolean;
    exportEnabled: boolean;
  };
}

// Default system settings
const DEFAULT_SETTINGS: SystemSettings = {
  general: {
    systemName: "MyCleanOne Admin Panel",
    maintenanceMode: false,
    maxUsersPerLicense: 1,
    defaultLicenseExpiry: 365,
  },
  security: {
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requirePasswordChange: false,
  },
  notifications: {
    emailNotifications: true,
    webhookNotifications: true,
    adminAlerts: true,
  },
  features: {
    telemetryEnabled: true,
    auditLogging: true,
    exportEnabled: true,
  },
};

async function getSettingsHandler(request: NextRequest) {
  await dbConnect();

  try {
    // In a real implementation, these would be stored in a database
    // For now, we'll return the default settings with some dynamic values
    const settings = {
      ...DEFAULT_SETTINGS,
      // Add any dynamic settings here
    };

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch system settings",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

async function updateSettingsHandler(request: NextRequest) {
  await dbConnect();

  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json(
        {
          success: false,
          message: "Settings data is required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Validate settings structure
    const validatedSettings = validateSettings(settings);
    if (!validatedSettings.valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid settings format",
          code: "VALIDATION_ERROR",
          details: validatedSettings.errors,
        },
        { status: 400 }
      );
    }

    // In a real implementation, save to database
    // For now, we'll just return the updated settings
    const updatedSettings = {
      ...DEFAULT_SETTINGS,
      ...settings,
    };

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating system settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update system settings",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

function validateSettings(settings: any): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  // Validate general settings
  if (settings.general) {
    if (
      settings.general.maxUsersPerLicense &&
      settings.general.maxUsersPerLicense < 1
    ) {
      errors.push("maxUsersPerLicense must be at least 1");
    }
    if (
      settings.general.defaultLicenseExpiry &&
      settings.general.defaultLicenseExpiry < 1
    ) {
      errors.push("defaultLicenseExpiry must be at least 1 day");
    }
  }

  // Validate security settings
  if (settings.security) {
    if (
      settings.security.sessionTimeout &&
      settings.security.sessionTimeout < 5
    ) {
      errors.push("sessionTimeout must be at least 5 minutes");
    }
    if (
      settings.security.maxLoginAttempts &&
      settings.security.maxLoginAttempts < 1
    ) {
      errors.push("maxLoginAttempts must be at least 1");
    }
    if (
      settings.security.passwordMinLength &&
      settings.security.passwordMinLength < 6
    ) {
      errors.push("passwordMinLength must be at least 6 characters");
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export const GET = withAdminAuth(getSettingsHandler);
export const PUT = withAdminAuth(updateSettingsHandler);
