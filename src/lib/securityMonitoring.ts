import { NextRequest } from "next/server";
import dbConnect from "./db";
import AdminAudit from "@/models/AdminAudit";

export interface SecurityEvent {
  type:
    | "SUSPICIOUS_LOGIN"
    | "RATE_LIMIT_EXCEEDED"
    | "CSRF_VIOLATION"
    | "INVALID_TOKEN"
    | "PRIVILEGE_ESCALATION"
    | "BULK_OPERATION"
    | "UNUSUAL_ACTIVITY";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  ip: string;
  userAgent?: string;
  userId?: string;
  email?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface SecurityAlert {
  id: string;
  event: SecurityEvent;
  threshold: number;
  count: number;
  timeWindow: number; // in minutes
  notified: boolean;
  createdAt: Date;
}

class SecurityMonitor {
  private eventStore: Map<string, SecurityEvent[]> = new Map();
  private alertThresholds: Map<string, { count: number; timeWindow: number }> =
    new Map();

  constructor() {
    // Configure alert thresholds
    this.alertThresholds.set("SUSPICIOUS_LOGIN", { count: 5, timeWindow: 15 });
    this.alertThresholds.set("RATE_LIMIT_EXCEEDED", {
      count: 10,
      timeWindow: 5,
    });
    this.alertThresholds.set("CSRF_VIOLATION", { count: 3, timeWindow: 10 });
    this.alertThresholds.set("INVALID_TOKEN", { count: 10, timeWindow: 15 });
    this.alertThresholds.set("PRIVILEGE_ESCALATION", {
      count: 1,
      timeWindow: 1,
    });
    this.alertThresholds.set("BULK_OPERATION", { count: 5, timeWindow: 60 });
    this.alertThresholds.set("UNUSUAL_ACTIVITY", { count: 20, timeWindow: 30 });

    // Clean up old events every 5 minutes
    setInterval(() => this.cleanupOldEvents(), 5 * 60 * 1000);
  }

  /**
   * Extract IP address from request
   */
  private getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get("x-forwarded-for");
    const realIP = req.headers.get("x-real-ip");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : realIP || req.ip || "unknown";
    return ip.trim();
  }

  /**
   * Generate event key for grouping
   */
  private getEventKey(event: SecurityEvent): string {
    return `${event.type}:${event.ip}:${event.userId || "anonymous"}`;
  }

  /**
   * Record a security event
   */
  async recordEvent(event: SecurityEvent): Promise<void> {
    try {
      // Store in memory for immediate analysis
      const eventKey = this.getEventKey(event);
      if (!this.eventStore.has(eventKey)) {
        this.eventStore.set(eventKey, []);
      }
      this.eventStore.get(eventKey)!.push(event);

      // Store in database for long-term analysis
      await this.persistEvent(event);

      // Check if this triggers an alert
      await this.checkForAlerts(event);

      console.log(`Security event recorded: ${event.type} from ${event.ip}`);
    } catch (error) {
      console.error("Failed to record security event:", error);
    }
  }

  /**
   * Persist event to database
   */
  private async persistEvent(event: SecurityEvent): Promise<void> {
    try {
      await dbConnect();

      const auditData = {
        adminId: event.userId || null,
        action: `SECURITY_${event.type}`,
        entityType: "Security",
        entityId: null,
        payload: {
          severity: event.severity,
          description: event.description,
          ip: event.ip,
          userAgent: event.userAgent,
          metadata: event.metadata,
        },
        ipAddress: event.ip,
        userAgent: event.userAgent,
        timestamp: event.timestamp,
      };

      const audit = new AdminAudit(auditData);
      await audit.save();
    } catch (error) {
      console.error("Failed to persist security event:", error);
    }
  }

  /**
   * Check if event triggers an alert
   */
  private async checkForAlerts(event: SecurityEvent): Promise<void> {
    const threshold = this.alertThresholds.get(event.type);
    if (!threshold) return;

    const eventKey = this.getEventKey(event);
    const events = this.eventStore.get(eventKey) || [];

    // Filter events within the time window
    const cutoffTime = new Date(Date.now() - threshold.timeWindow * 60 * 1000);
    const recentEvents = events.filter((e) => e.timestamp >= cutoffTime);

    if (recentEvents.length >= threshold.count) {
      await this.triggerAlert(event, recentEvents.length, threshold);
    }
  }

  /**
   * Trigger a security alert
   */
  private async triggerAlert(
    event: SecurityEvent,
    count: number,
    threshold: { count: number; timeWindow: number }
  ): Promise<void> {
    const alert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event,
      threshold: threshold.count,
      count,
      timeWindow: threshold.timeWindow,
      notified: false,
      createdAt: new Date(),
    };

    console.warn(`🚨 SECURITY ALERT: ${event.type}`, {
      severity: event.severity,
      count,
      threshold: threshold.count,
      timeWindow: threshold.timeWindow,
      ip: event.ip,
      userId: event.userId,
      description: event.description,
    });

    // Send notifications (implement based on your notification system)
    await this.sendAlertNotification(alert);
  }

  /**
   * Send alert notification
   */
  private async sendAlertNotification(alert: SecurityAlert): Promise<void> {
    try {
      // This is where you'd integrate with your notification system
      // Examples: email, Slack, PagerDuty, etc.

      const message = `
🚨 Security Alert: ${alert.event.type}
Severity: ${alert.event.severity}
Count: ${alert.count} events in ${alert.timeWindow} minutes
IP: ${alert.event.ip}
User: ${alert.event.email || alert.event.userId || "Anonymous"}
Description: ${alert.event.description}
Time: ${alert.createdAt.toISOString()}
      `.trim();

      // For now, just log to console
      console.error("SECURITY ALERT NOTIFICATION:", message);

      // TODO: Implement actual notification sending
      // await sendEmailAlert(message);
      // await sendSlackAlert(message);

      alert.notified = true;
    } catch (error) {
      console.error("Failed to send security alert notification:", error);
    }
  }

  /**
   * Clean up old events from memory
   */
  private cleanupOldEvents(): void {
    const cutoffTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

    for (const [key, events] of this.eventStore.entries()) {
      const recentEvents = events.filter(
        (event) => event.timestamp >= cutoffTime
      );
      if (recentEvents.length === 0) {
        this.eventStore.delete(key);
      } else {
        this.eventStore.set(key, recentEvents);
      }
    }
  }

  /**
   * Get security statistics
   */
  async getSecurityStats(timeWindow: number = 24): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    topIPs: Array<{ ip: string; count: number }>;
  }> {
    const cutoffTime = new Date(Date.now() - timeWindow * 60 * 60 * 1000);
    const allEvents: SecurityEvent[] = [];

    // Collect all recent events
    for (const events of this.eventStore.values()) {
      allEvents.push(
        ...events.filter((event) => event.timestamp >= cutoffTime)
      );
    }

    // Calculate statistics
    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const ipCounts: Record<string, number> = {};

    allEvents.forEach((event) => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] =
        (eventsBySeverity[event.severity] || 0) + 1;
      ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1;
    });

    const topIPs = Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    return {
      totalEvents: allEvents.length,
      eventsByType,
      eventsBySeverity,
      topIPs,
    };
  }
}

// Global security monitor instance
export const securityMonitor = new SecurityMonitor();

/**
 * Helper functions to record specific security events
 */
export async function recordSuspiciousLogin(
  req: NextRequest,
  email: string,
  reason: string
): Promise<void> {
  await securityMonitor.recordEvent({
    type: "SUSPICIOUS_LOGIN",
    severity: "HIGH",
    description: `Suspicious login attempt: ${reason}`,
    ip: securityMonitor["getClientIP"](req),
    userAgent: req.headers.get("user-agent") || undefined,
    email,
    timestamp: new Date(),
  });
}

export async function recordRateLimitExceeded(
  req: NextRequest,
  userId?: string
): Promise<void> {
  await securityMonitor.recordEvent({
    type: "RATE_LIMIT_EXCEEDED",
    severity: "MEDIUM",
    description: "Rate limit exceeded",
    ip: securityMonitor["getClientIP"](req),
    userAgent: req.headers.get("user-agent") || undefined,
    userId,
    timestamp: new Date(),
  });
}

export async function recordCSRFViolation(
  req: NextRequest,
  userId?: string
): Promise<void> {
  await securityMonitor.recordEvent({
    type: "CSRF_VIOLATION",
    severity: "HIGH",
    description: "CSRF token validation failed",
    ip: securityMonitor["getClientIP"](req),
    userAgent: req.headers.get("user-agent") || undefined,
    userId,
    timestamp: new Date(),
  });
}

export async function recordInvalidToken(
  req: NextRequest,
  reason: string
): Promise<void> {
  await securityMonitor.recordEvent({
    type: "INVALID_TOKEN",
    severity: "MEDIUM",
    description: `Invalid token: ${reason}`,
    ip: securityMonitor["getClientIP"](req),
    userAgent: req.headers.get("user-agent") || undefined,
    timestamp: new Date(),
  });
}

export async function recordPrivilegeEscalation(
  req: NextRequest,
  userId: string,
  attemptedAction: string
): Promise<void> {
  await securityMonitor.recordEvent({
    type: "PRIVILEGE_ESCALATION",
    severity: "CRITICAL",
    description: `Privilege escalation attempt: ${attemptedAction}`,
    ip: securityMonitor["getClientIP"](req),
    userAgent: req.headers.get("user-agent") || undefined,
    userId,
    timestamp: new Date(),
  });
}

export async function recordBulkOperation(
  req: NextRequest,
  userId: string,
  operation: string,
  count: number
): Promise<void> {
  await securityMonitor.recordEvent({
    type: "BULK_OPERATION",
    severity: count > 100 ? "HIGH" : "MEDIUM",
    description: `Bulk operation: ${operation} (${count} items)`,
    ip: securityMonitor["getClientIP"](req),
    userAgent: req.headers.get("user-agent") || undefined,
    userId,
    metadata: { operation, count },
    timestamp: new Date(),
  });
}

export async function recordUnusualActivity(
  req: NextRequest,
  userId: string,
  activity: string
): Promise<void> {
  await securityMonitor.recordEvent({
    type: "UNUSUAL_ACTIVITY",
    severity: "LOW",
    description: `Unusual activity: ${activity}`,
    ip: securityMonitor["getClientIP"](req),
    userAgent: req.headers.get("user-agent") || undefined,
    userId,
    timestamp: new Date(),
  });
}

/**
 * Middleware to automatically record security events
 */
export function withSecurityMonitoring(
  handler: (req: NextRequest, ...args: any[]) => Promise<Response>
) {
  return async (req: NextRequest, ...args: any[]): Promise<Response> => {
    const startTime = Date.now();

    try {
      const response = await handler(req, ...args);

      // Record unusual response times
      const responseTime = Date.now() - startTime;
      if (responseTime > 10000) {
        // More than 10 seconds
        const authHeader = req.headers.get("authorization");
        const token = authHeader?.replace(/^Bearer\s+/i, "");
        await recordUnusualActivity(
          req,
          token || "anonymous",
          `Slow response: ${responseTime}ms`
        );
      }

      return response;
    } catch (error) {
      // Record unexpected errors
      const authHeader = req.headers.get("authorization");
      const token = authHeader?.replace(/^Bearer\s+/i, "");
      await recordUnusualActivity(
        req,
        token || "anonymous",
        `Unexpected error: ${error.message}`
      );
      throw error;
    }
  };
}

export default SecurityMonitor;
