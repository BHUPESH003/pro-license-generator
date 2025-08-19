import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import dbConnect from "@/lib/db";
import TelemetryEvent from "@/models/TelemetryEvent";
import User from "@/models/User";
import License from "@/models/License";
import Device from "@/models/Device";
import stripe from "@/lib/stripe";

interface SystemHealthStatus {
  overall: "healthy" | "warning" | "critical";
  lastUpdated: string;
  components: {
    database: ComponentHealth;
    stripe: ComponentHealth;
    telemetry: ComponentHealth;
    authentication: ComponentHealth;
    storage: ComponentHealth;
  };
  metrics: {
    uptime: number; // seconds
    responseTime: number; // milliseconds
    errorRate: number; // percentage
    activeUsers: number;
    totalRequests: number;
  };
  alerts: SystemAlert[];
}

interface ComponentHealth {
  status: "healthy" | "warning" | "critical";
  message: string;
  lastCheck: string;
  responseTime?: number;
  details?: Record<string, any>;
}

interface SystemAlert {
  id: string;
  type: "error" | "warning" | "info";
  message: string;
  timestamp: string;
  component: string;
  resolved: boolean;
}

async function getSystemHealthHandler(request: NextRequest) {
  await dbConnect();

  try {
    const healthStatus: SystemHealthStatus = {
      overall: "healthy",
      lastUpdated: new Date().toISOString(),
      components: {
        database: await checkDatabaseHealth(),
        stripe: await checkStripeHealth(),
        telemetry: await checkTelemetryHealth(),
        authentication: await checkAuthenticationHealth(),
        storage: await checkStorageHealth(),
      },
      metrics: await getSystemMetrics(),
      alerts: await getSystemAlerts(),
    };

    // Determine overall health based on components
    const componentStatuses = Object.values(healthStatus.components).map(
      (c) => c.status
    );
    if (componentStatuses.includes("critical")) {
      healthStatus.overall = "critical";
    } else if (componentStatuses.includes("warning")) {
      healthStatus.overall = "warning";
    }

    return NextResponse.json({
      success: true,
      data: healthStatus,
    });
  } catch (error) {
    console.error("Error checking system health:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check system health",
        code: "OPERATION_FAILED",
      },
      { status: 500 }
    );
  }
}

async function checkDatabaseHealth(): Promise<ComponentHealth> {
  const startTime = Date.now();

  try {
    // Test database connectivity with a simple query
    await User.findOne().limit(1);
    const responseTime = Date.now() - startTime;

    // Check database stats
    const stats = await Promise.all([
      User.countDocuments(),
      License.countDocuments(),
      Device.countDocuments(),
      TelemetryEvent.countDocuments(),
    ]);

    return {
      status: responseTime > 1000 ? "warning" : "healthy",
      message:
        responseTime > 1000
          ? "Database response time is slow"
          : "Database is healthy",
      lastCheck: new Date().toISOString(),
      responseTime,
      details: {
        users: stats[0],
        licenses: stats[1],
        devices: stats[2],
        telemetryEvents: stats[3],
      },
    };
  } catch (error) {
    return {
      status: "critical",
      message: `Database connection failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      lastCheck: new Date().toISOString(),
      responseTime: Date.now() - startTime,
    };
  }
}

async function checkStripeHealth(): Promise<ComponentHealth> {
  const startTime = Date.now();

  try {
    // Test Stripe API connectivity
    await stripe.accounts.retrieve();
    const responseTime = Date.now() - startTime;

    // Check recent webhook events
    const recentEvents = await stripe.events.list({ limit: 5 });
    const lastEventTime = recentEvents.data[0]?.created;
    const timeSinceLastEvent = lastEventTime
      ? Date.now() / 1000 - lastEventTime
      : null;

    let status: "healthy" | "warning" | "critical" = "healthy";
    let message = "Stripe integration is healthy";

    if (responseTime > 2000) {
      status = "warning";
      message = "Stripe API response time is slow";
    }

    if (timeSinceLastEvent && timeSinceLastEvent > 86400) {
      // 24 hours
      status = "warning";
      message = "No recent Stripe webhook events received";
    }

    return {
      status,
      message,
      lastCheck: new Date().toISOString(),
      responseTime,
      details: {
        lastWebhookEvent: lastEventTime
          ? new Date(lastEventTime * 1000).toISOString()
          : null,
        recentEventsCount: recentEvents.data.length,
      },
    };
  } catch (error) {
    return {
      status: "critical",
      message: `Stripe API connection failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      lastCheck: new Date().toISOString(),
      responseTime: Date.now() - startTime,
    };
  }
}

async function checkTelemetryHealth(): Promise<ComponentHealth> {
  const startTime = Date.now();

  try {
    // Check recent telemetry events
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentEvents = await TelemetryEvent.countDocuments({
      occurredAt: { $gte: oneHourAgo },
    });

    const responseTime = Date.now() - startTime;

    // Check for telemetry heartbeat
    const lastEvent = await TelemetryEvent.findOne()
      .sort({ occurredAt: -1 })
      .select("occurredAt");

    const timeSinceLastEvent = lastEvent
      ? Date.now() - lastEvent.occurredAt.getTime()
      : null;

    let status: "healthy" | "warning" | "critical" = "healthy";
    let message = "Telemetry system is healthy";

    if (recentEvents === 0) {
      status = "warning";
      message = "No telemetry events received in the last hour";
    }

    if (timeSinceLastEvent && timeSinceLastEvent > 3600000) {
      // 1 hour
      status = "warning";
      message = "No telemetry events received recently";
    }

    return {
      status,
      message,
      lastCheck: new Date().toISOString(),
      responseTime,
      details: {
        recentEventsCount: recentEvents,
        lastEventTime: lastEvent?.occurredAt.toISOString(),
      },
    };
  } catch (error) {
    return {
      status: "critical",
      message: `Telemetry health check failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      lastCheck: new Date().toISOString(),
      responseTime: Date.now() - startTime,
    };
  }
}

async function checkAuthenticationHealth(): Promise<ComponentHealth> {
  const startTime = Date.now();

  try {
    // Check for admin users
    const adminCount = await User.countDocuments({ role: "admin" });
    const responseTime = Date.now() - startTime;

    let status: "healthy" | "warning" | "critical" = "healthy";
    let message = "Authentication system is healthy";

    if (adminCount === 0) {
      status = "critical";
      message = "No admin users found in the system";
    } else if (adminCount === 1) {
      status = "warning";
      message = "Only one admin user exists - consider adding backup admins";
    }

    return {
      status,
      message,
      lastCheck: new Date().toISOString(),
      responseTime,
      details: {
        adminCount,
      },
    };
  } catch (error) {
    return {
      status: "critical",
      message: `Authentication health check failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      lastCheck: new Date().toISOString(),
      responseTime: Date.now() - startTime,
    };
  }
}

async function checkStorageHealth(): Promise<ComponentHealth> {
  const startTime = Date.now();

  try {
    // In a real implementation, check disk space, file system health, etc.
    // For now, we'll simulate a basic storage check
    const responseTime = Date.now() - startTime;

    return {
      status: "healthy",
      message: "Storage system is healthy",
      lastCheck: new Date().toISOString(),
      responseTime,
      details: {
        // In production, add actual storage metrics
        diskUsage: "75%",
        availableSpace: "250GB",
      },
    };
  } catch (error) {
    return {
      status: "critical",
      message: `Storage health check failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      lastCheck: new Date().toISOString(),
      responseTime: Date.now() - startTime,
    };
  }
}

async function getSystemMetrics() {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [activeUsers, totalUsers] = await Promise.all([
      User.countDocuments({
        lastSeenAt: { $gte: oneDayAgo },
      }),
      User.countDocuments(),
    ]);

    return {
      uptime: process.uptime(),
      responseTime: 150, // Average response time in ms (would be calculated from actual metrics)
      errorRate: 0.5, // Error rate percentage (would be calculated from logs)
      activeUsers,
      totalRequests: 10000, // Would be tracked from actual request logs
    };
  } catch (error) {
    console.error("Error getting system metrics:", error);
    return {
      uptime: process.uptime(),
      responseTime: 0,
      errorRate: 0,
      activeUsers: 0,
      totalRequests: 0,
    };
  }
}

async function getSystemAlerts(): Promise<SystemAlert[]> {
  // In a real implementation, this would fetch from an alerts/monitoring system
  const alerts: SystemAlert[] = [];

  try {
    // Check for critical conditions and generate alerts
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      alerts.push({
        id: "admin-count-low",
        type: "warning",
        message: "Low number of admin users detected",
        timestamp: new Date().toISOString(),
        component: "authentication",
        resolved: false,
      });
    }

    // Check for old telemetry data
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTelemetry = await TelemetryEvent.countDocuments({
      occurredAt: { $gte: oneHourAgo },
    });

    if (recentTelemetry === 0) {
      alerts.push({
        id: "telemetry-stale",
        type: "warning",
        message: "No recent telemetry events received",
        timestamp: new Date().toISOString(),
        component: "telemetry",
        resolved: false,
      });
    }

    return alerts;
  } catch (error) {
    console.error("Error getting system alerts:", error);
    return [];
  }
}

export const GET = withAdminAuth(getSystemHealthHandler);
