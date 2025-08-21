import { NextRequest } from "next/server";
import { GET as getUsersHandler } from "@/app/api/admin/users/route";
import { GET as getDevicesHandler } from "@/app/api/admin/devices/route";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Device from "@/models/Device";
import License from "@/models/License";
import { sign } from "jsonwebtoken";

// Mock the database connection
jest.mock("@/lib/db");
const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;

// Mock the models
jest.mock("@/models/User");
jest.mock("@/models/Device");
jest.mock("@/models/License");

const mockUser = User as jest.Mocked<typeof User>;
const mockDevice = Device as jest.Mocked<typeof Device>;
const mockLicense = License as jest.Mocked<typeof License>;

describe("Admin API Integration Tests", () => {
  const adminToken = sign(
    { userId: "admin123", email: "admin@test.com" },
    process.env.JWT_SECRET || "test-secret"
  );

  const testUsers = [
    {
      _id: "user1",
      email: "user1@test.com",
      name: "User One",
      role: "user",
      createdAt: new Date("2024-01-01"),
      licenseCount: 2,
      deviceCount: 1,
    },
    {
      _id: "user2",
      email: "user2@test.com",
      name: "User Two",
      role: "admin",
      createdAt: new Date("2024-01-15"),
      licenseCount: 1,
      deviceCount: 3,
    },
  ];

  const testDevices = [
    {
      _id: "device1",
      name: "Test Device 1",
      os: "Windows 11",
      deviceGuid: "guid-1",
      status: "active",
      lastActivity: new Date("2024-01-20"),
      user: { _id: "user1", email: "user1@test.com", name: "User One" },
      license: {
        _id: "license1",
        licenseKey: "KEY-1",
        status: "active",
        plan: "pro",
      },
      telemetryStats: {
        totalEvents: 100,
        lastEventDate: new Date(),
        recentEventTypes: ["login"],
      },
    },
    {
      _id: "device2",
      name: "Test Device 2",
      os: "macOS",
      deviceGuid: "guid-2",
      status: "inactive",
      lastActivity: new Date("2024-01-10"),
      user: { _id: "user2", email: "user2@test.com", name: "User Two" },
      license: {
        _id: "license2",
        licenseKey: "KEY-2",
        status: "active",
        plan: "basic",
      },
      telemetryStats: {
        totalEvents: 50,
        lastEventDate: new Date(),
        recentEventTypes: ["logout"],
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(true);

    // Mock admin user verification
    mockUser.findById.mockResolvedValue({
      _id: "admin123",
      email: "admin@test.com",
      role: "admin",
    });
  });

  describe("GET /api/admin/users", () => {
    beforeEach(() => {
      // Mock User.aggregate for users endpoint
      mockUser.aggregate
        .mockResolvedValueOnce([{ total: testUsers.length }]) // Count query
        .mockResolvedValueOnce(testUsers); // Data query
    });

    it("should return paginated users with default parameters", async () => {
      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        headers: { authorization: `Bearer ${adminToken}` },
      });

      const response = await getUsersHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.rows).toHaveLength(2);
      expect(data.data.page).toBe(1);
      expect(data.data.pageSize).toBe(25);
      expect(data.data.total).toBe(2);
      expect(data.data.totalPages).toBe(1);
    });

    it("should filter users by email", async () => {
      const filteredUsers = [testUsers[0]];
      mockUser.aggregate
        .mockResolvedValueOnce([{ total: 1 }])
        .mockResolvedValueOnce(filteredUsers);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?filter_email=user1",
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const response = await getUsersHandler(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.rows).toHaveLength(1);
      expect(data.data.rows[0].email).toBe("user1@test.com");
    });

    it("should filter users by role", async () => {
      const adminUsers = [testUsers[1]];
      mockUser.aggregate
        .mockResolvedValueOnce([{ total: 1 }])
        .mockResolvedValueOnce(adminUsers);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?filter_role=admin",
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const response = await getUsersHandler(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.rows).toHaveLength(1);
      expect(data.data.rows[0].role).toBe("admin");
    });

    it("should sort users by creation date descending", async () => {
      const sortedUsers = [testUsers[1], testUsers[0]];
      mockUser.aggregate
        .mockResolvedValueOnce([{ total: 2 }])
        .mockResolvedValueOnce(sortedUsers);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?sortBy=createdAt&sortDir=desc",
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const response = await getUsersHandler(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.rows[0].email).toBe("user2@test.com");
      expect(data.data.rows[1].email).toBe("user1@test.com");
    });

    it("should handle pagination correctly", async () => {
      mockUser.aggregate
        .mockResolvedValueOnce([{ total: 10 }])
        .mockResolvedValueOnce([testUsers[0]]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?page=2&pageSize=1",
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const response = await getUsersHandler(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.page).toBe(2);
      expect(data.data.pageSize).toBe(1);
      expect(data.data.total).toBe(10);
      expect(data.data.totalPages).toBe(10);
    });

    it("should export users as CSV", async () => {
      mockUser.aggregate.mockResolvedValueOnce(testUsers);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?export=csv",
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const response = await getUsersHandler(request);
      const csvData = await response.text();

      expect(response.headers.get("content-type")).toBe("text/csv");
      expect(response.headers.get("content-disposition")).toContain(
        "users-export.csv"
      );
      expect(csvData).toContain("ID,Email,Name,Role");
      expect(csvData).toContain("user1@test.com");
      expect(csvData).toContain("user2@test.com");
    });

    it("should return 401 for missing token", async () => {
      const request = new NextRequest("http://localhost:3000/api/admin/users");

      const response = await getUsersHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.code).toBe("AUTHENTICATION_REQUIRED");
    });

    it("should return 403 for non-admin user", async () => {
      mockUser.findById.mockResolvedValue({
        _id: "user123",
        email: "user@test.com",
        role: "user",
      });

      const userToken = sign(
        { userId: "user123", email: "user@test.com" },
        process.env.JWT_SECRET || "test-secret"
      );

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        headers: { authorization: `Bearer ${userToken}` },
      });

      const response = await getUsersHandler(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.code).toBe("AUTHORIZATION_FAILED");
    });
  });

  describe("GET /api/admin/devices", () => {
    beforeEach(() => {
      // Mock Device.aggregate for devices endpoint
      mockDevice.aggregate
        .mockResolvedValueOnce([{ total: testDevices.length }]) // Count query
        .mockResolvedValueOnce(testDevices); // Data query
    });

    it("should return paginated devices with default parameters", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/admin/devices",
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const response = await getDevicesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.rows).toHaveLength(2);
      expect(data.data.page).toBe(1);
      expect(data.data.pageSize).toBe(25);
      expect(data.data.total).toBe(2);
    });

    it("should filter devices by status", async () => {
      const activeDevices = [testDevices[0]];
      mockDevice.aggregate
        .mockResolvedValueOnce([{ total: 1 }])
        .mockResolvedValueOnce(activeDevices);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/devices?filter_status=active",
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const response = await getDevicesHandler(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.rows).toHaveLength(1);
      expect(data.data.rows[0].status).toBe("active");
    });

    it("should filter devices by OS", async () => {
      const windowsDevices = [testDevices[0]];
      mockDevice.aggregate
        .mockResolvedValueOnce([{ total: 1 }])
        .mockResolvedValueOnce(windowsDevices);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/devices?filter_os=Windows",
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const response = await getDevicesHandler(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.rows).toHaveLength(1);
      expect(data.data.rows[0].os).toBe("Windows 11");
    });

    it("should handle user email filter with no matching users", async () => {
      mockUser.find.mockResolvedValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/devices?filter_userEmail=nonexistent",
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const response = await getDevicesHandler(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.rows).toHaveLength(0);
      expect(data.data.total).toBe(0);
    });

    it("should export devices as CSV", async () => {
      mockDevice.aggregate.mockResolvedValueOnce(testDevices);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/devices?export=csv",
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const response = await getDevicesHandler(request);
      const csvData = await response.text();

      expect(response.headers.get("content-type")).toBe("text/csv");
      expect(response.headers.get("content-disposition")).toContain(
        "devices-export.csv"
      );
      expect(csvData).toContain("Device Name,OS,Device GUID");
      expect(csvData).toContain("Test Device 1");
      expect(csvData).toContain("Windows 11");
    });

    it("should handle database errors gracefully", async () => {
      mockDevice.aggregate.mockRejectedValue(
        new Error("Database connection failed")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/admin/devices",
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const response = await getDevicesHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.message).toBe("Failed to fetch devices");
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid JWT tokens", async () => {
      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        headers: { authorization: "Bearer invalid-token" },
      });

      const response = await getUsersHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.code).toBe("AUTHENTICATION_REQUIRED");
    });

    it("should handle database connection failures", async () => {
      mockDbConnect.mockRejectedValue(new Error("Database connection failed"));

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        headers: { authorization: `Bearer ${adminToken}` },
      });

      const response = await getUsersHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});
