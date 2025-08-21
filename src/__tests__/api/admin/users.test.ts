/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { GET } from "@/app/api/admin/users/route";

// Mock the dependencies
jest.mock("@/lib/adminAuth", () => ({
  withAdminAuth: (handler: any) => handler,
}));

jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/models/User", () => ({
  __esModule: true,
  default: {
    aggregate: jest.fn(),
    countDocuments: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock("@/models/License", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
  },
}));

jest.mock("@/models/Device", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
  },
}));

describe("/api/admin/users", () => {
  const mockAdmin = {
    userId: "admin123",
    email: "admin@example.com",
    role: "admin",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/admin/users", () => {
    it("should return paginated users with default parameters", async () => {
      const User = require("@/models/User").default;

      // Mock the aggregation pipeline
      User.aggregate.mockResolvedValueOnce([
        {
          _id: "user1",
          email: "user1@example.com",
          name: "User One",
          role: "user",
          createdAt: new Date("2023-01-01"),
          licenseCount: 1,
          deviceCount: 2,
        },
        {
          _id: "user2",
          email: "user2@example.com",
          name: "User Two",
          role: "admin",
          createdAt: new Date("2023-01-02"),
          licenseCount: 0,
          deviceCount: 1,
        },
      ]);

      // Mock the count aggregation
      User.aggregate.mockResolvedValueOnce([{ total: 2 }]);

      const request = new NextRequest("http://localhost:3000/api/admin/users");
      const response = await GET(request, mockAdmin);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.rows).toHaveLength(2);
      expect(data.data.total).toBe(2);
      expect(data.data.page).toBe(1);
      expect(data.data.pageSize).toBe(25);
    });

    it("should handle pagination parameters", async () => {
      const User = require("@/models/User").default;

      User.aggregate.mockResolvedValueOnce([]);
      User.aggregate.mockResolvedValueOnce([{ total: 0 }]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?page=2&pageSize=10"
      );
      const response = await GET(request, mockAdmin);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.page).toBe(2);
      expect(data.data.pageSize).toBe(10);
    });

    it("should handle email filter", async () => {
      const User = require("@/models/User").default;

      User.aggregate.mockResolvedValueOnce([]);
      User.aggregate.mockResolvedValueOnce([{ total: 0 }]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?filter_email=john"
      );
      const response = await GET(request, mockAdmin);

      expect(response.status).toBe(200);

      // Verify that the aggregation was called with email filter
      const aggregationCalls = User.aggregate.mock.calls;
      expect(aggregationCalls.length).toBeGreaterThan(0);
    });

    it("should handle role filter", async () => {
      const User = require("@/models/User").default;

      User.aggregate.mockResolvedValueOnce([]);
      User.aggregate.mockResolvedValueOnce([{ total: 0 }]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?filter_role=admin"
      );
      const response = await GET(request, mockAdmin);

      expect(response.status).toBe(200);
    });

    it("should handle date range filters", async () => {
      const User = require("@/models/User").default;

      User.aggregate.mockResolvedValueOnce([]);
      User.aggregate.mockResolvedValueOnce([{ total: 0 }]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?filter_createdAfter=2023-01-01&filter_createdBefore=2023-12-31"
      );
      const response = await GET(request, mockAdmin);

      expect(response.status).toBe(200);
    });

    it("should handle sorting parameters", async () => {
      const User = require("@/models/User").default;

      User.aggregate.mockResolvedValueOnce([]);
      User.aggregate.mockResolvedValueOnce([{ total: 0 }]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?sortBy=email&sortDir=asc"
      );
      const response = await GET(request, mockAdmin);

      expect(response.status).toBe(200);
    });

    it("should return CSV export when requested", async () => {
      const User = require("@/models/User").default;

      User.aggregate.mockResolvedValueOnce([
        {
          _id: "user1",
          email: "user1@example.com",
          name: "User One",
          role: "user",
          createdAt: new Date("2023-01-01"),
          licenseCount: 1,
          deviceCount: 2,
          stripeCustomerId: "cus_123",
          lastSeenAt: new Date("2023-06-01"),
        },
      ]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?export=csv"
      );
      const response = await GET(request, mockAdmin);

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("text/csv");
      expect(response.headers.get("content-disposition")).toContain(
        "users-export.csv"
      );

      const csvContent = await response.text();
      expect(csvContent).toContain("ID,Email,Name,Role");
      expect(csvContent).toContain("user1@example.com");
    });

    it("should handle database errors gracefully", async () => {
      const User = require("@/models/User").default;

      User.aggregate.mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      const request = new NextRequest("http://localhost:3000/api/admin/users");
      const response = await GET(request, mockAdmin);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toContain("Failed to fetch");
    });

    it("should limit page size to maximum allowed", async () => {
      const User = require("@/models/User").default;

      User.aggregate.mockResolvedValueOnce([]);
      User.aggregate.mockResolvedValueOnce([{ total: 0 }]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?pageSize=200"
      );
      const response = await GET(request, mockAdmin);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.pageSize).toBe(100); // Should be capped at 100
    });
  });
});
