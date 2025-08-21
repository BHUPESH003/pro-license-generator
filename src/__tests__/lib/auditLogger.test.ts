import {
  createCrudAuditData,
  createCustomAuditData,
  sanitizePayload,
} from "@/lib/auditLogger";

// Mock the database connection and AdminAudit model
jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/models/AdminAudit", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue(true),
  })),
}));

describe("Audit Logger Utils", () => {
  describe("createCrudAuditData", () => {
    it("should create audit data for CREATE operation", () => {
      const result = createCrudAuditData("CREATE", "User", "user123", {
        name: "John",
      });

      expect(result).toEqual({
        action: "USER_CREATE",
        entityType: "User",
        entityId: "user123",
        payload: { name: "John" },
      });
    });

    it("should create audit data for UPDATE operation", () => {
      const result = createCrudAuditData("UPDATE", "License", "license456", {
        status: "active",
      });

      expect(result).toEqual({
        action: "LICENSE_UPDATE",
        entityType: "License",
        entityId: "license456",
        payload: { status: "active" },
      });
    });

    it("should create audit data for DELETE operation without payload", () => {
      const result = createCrudAuditData("DELETE", "Device", "device789");

      expect(result).toEqual({
        action: "DEVICE_DELETE",
        entityType: "Device",
        entityId: "device789",
        payload: undefined,
      });
    });

    it("should create audit data for READ operation", () => {
      const result = createCrudAuditData("READ", "TelemetryEvent", "event123");

      expect(result).toEqual({
        action: "TELEMETRYEVENT_READ",
        entityType: "TelemetryEvent",
        entityId: "event123",
        payload: undefined,
      });
    });
  });

  describe("createCustomAuditData", () => {
    it("should create custom audit data", () => {
      const result = createCustomAuditData(
        "PASSWORD_RESET",
        "User",
        "user123",
        { resetMethod: "email" }
      );

      expect(result).toEqual({
        action: "PASSWORD_RESET",
        entityType: "User",
        entityId: "user123",
        payload: { resetMethod: "email" },
      });
    });

    it("should create custom audit data without entity ID", () => {
      const result = createCustomAuditData(
        "SYSTEM_BACKUP",
        "System",
        undefined,
        { backupSize: "1GB" }
      );

      expect(result).toEqual({
        action: "SYSTEM_BACKUP",
        entityType: "System",
        entityId: undefined,
        payload: { backupSize: "1GB" },
      });
    });
  });

  describe("sanitizePayload", () => {
    it("should return non-object values as-is", () => {
      expect(sanitizePayload("string")).toBe("string");
      expect(sanitizePayload(123)).toBe(123);
      expect(sanitizePayload(true)).toBe(true);
      expect(sanitizePayload(null)).toBe(null);
      expect(sanitizePayload(undefined)).toBe(undefined);
    });

    it("should sanitize sensitive fields", () => {
      const payload = {
        username: "john",
        password: "secret123",
        email: "john@example.com",
        token: "abc123",
        secret: "mysecret",
        key: "mykey",
        auth: "authdata",
      };

      const sanitized = sanitizePayload(payload);

      expect(sanitized).toEqual({
        username: "john",
        password: "[REDACTED]",
        email: "john@example.com",
        token: "[REDACTED]",
        secret: "[REDACTED]",
        key: "[REDACTED]",
        auth: "[REDACTED]",
      });
    });

    it("should recursively sanitize nested objects", () => {
      const payload = {
        user: {
          name: "John",
          password: "secret123",
          profile: {
            email: "john@example.com",
            token: "abc123",
          },
        },
        settings: {
          theme: "dark",
          secret: "mysecret",
        },
      };

      const sanitized = sanitizePayload(payload);

      expect(sanitized).toEqual({
        user: {
          name: "John",
          password: "[REDACTED]",
          profile: {
            email: "john@example.com",
            token: "[REDACTED]",
          },
        },
        settings: {
          theme: "dark",
          secret: "[REDACTED]",
        },
      });
    });

    it("should handle arrays", () => {
      const payload = {
        users: [
          { name: "John", password: "secret1" },
          { name: "Jane", password: "secret2" },
        ],
      };

      const sanitized = sanitizePayload(payload);

      expect(sanitized).toEqual({
        users: [
          { name: "John", password: "[REDACTED]" },
          { name: "Jane", password: "[REDACTED]" },
        ],
      });
    });

    it("should handle null values in objects", () => {
      const payload = {
        name: "John",
        password: "secret123",
        profile: null,
      };

      const sanitized = sanitizePayload(payload);

      expect(sanitized).toEqual({
        name: "John",
        password: "[REDACTED]",
        profile: null,
      });
    });
  });
});
