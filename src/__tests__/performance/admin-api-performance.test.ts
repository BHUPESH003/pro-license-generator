import { NextRequest } from "next/server";
import { GET as getUsersHandler } from "@/app/api/admin/users/route";
import { GET as getDevicesHandler } from "@/app/api/admin/devices/route";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Device from "@/models/Device";
import License from "@/models/License";
import TelemetryEvent from "@/models/TelemetryEvent";
import { sign } from "jsonwebtoken";

// Mock the database connection and models
jest.mock("@/lib/db");
jest.mock("@/models/User");
jest.mock("@/models/Device");
jest.mock("@/models/License");
jest.mock("@/models/TelemetryEvent");

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockUser = User as jest.Mocked<typeof User>;
const mockDevice = Device as jest.Mocked<typeof Device>;
const mockLicense = License as jest.Mocked<typeof License>;
const mockTelemetryEvent = TelemetryEvent as jest.Mocked<typeof TelemetryEvent>;

describe("Admin API Performance Tests", () => {
  const adminToken = sign(
    { userId: "admin123", email: "admin@test.com" },
    process.env.JWT_SECRET || "test-secret"
  );

  // Generate large dataset for performance testing
  const generateLargeUserDataset = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      _id: `user${i}`,
      email: `user${i}@test.com`,
      name: `User ${i}`,
      role: i % 10 === 0 ? "admin" : "user",
      createdAt: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ),
      licenseCount: Math.floor(Math.random() * 5),
      deviceCount: Math.floor(Math.random() * 3),
    }));
  };

  const generateLargeDeviceDataset = (count: number) => {
    const osOptions = [
      "Windows 11",
      "Windows 10",
      "macOS",
      "Linux Ubuntu",
      "Linux CentOS",
    ];
    const statusOptions = ["active", "inactive"];

    return Array.from({ length: count }, (_, i) => ({
      _id: `device${i}`,
      name: `Device ${i}`,
      os: osOptions[i % osOptions.length],
      deviceGuid: `guid-${i}`,
      status: statusOptions[i % statusOptions.length],
      lastActivity: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ),
      user: {
        _id: `user${i % 100}`,
        email: `user${i % 100}@test.com`,
        name: `User ${i % 100}`,
      },
      license: {
        _id: `license${i % 50}`,
        licenseKey: `KEY-${i % 50}`,
        status: "active",
        plan: i % 3 === 0 ? "pro" : "basic",
      },
      telemetryStats: {
        totalEvents: Math.floor(Math.random() * 1000),
        lastEventDate: new Date(),
        recentEventTypes: ["login", "logout", "error"].slice(
          0,
          Math.floor(Math.random() * 3) + 1
        ),
      },
    }));
  };

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

  describe("Large Dataset Performance", () => {
    test("should handle 10,000 users efficiently", async () => {
      const largeUserDataset = generateLargeUserDataset(10000);

      mockUser.aggregate
        .mockResolvedValueOnce([{ total: 10000 }])
        .mockResolvedValueOnce(largeUserDataset.slice(0, 25)); // First page

      const request = new NextRequest("http://localhost:3000/api/admin/users", {
        headers: { authorization: `Bearer ${adminToken}` },
      });

      const startTime = performance.now();
      const response = await getUsersHandler(request);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // Should complete within 1 second

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.total).toBe(10000);
      expect(data.data.rows).toHaveLength(25);
    });

    test("should handle 5,000 devices efficiently", async () => {
      const largeDeviceDataset = generateLargeDeviceDataset(5000);

      mockDevice.aggregate
        .mockResolvedValueOnce([{ total: 5000 }])
        .mockResolvedValueOnce(largeDeviceDataset.slice(0, 25));

      // Mock telemetry stats aggregation
      mockTelemetryEvent.aggregate.mockResolvedValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/devices",
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const startTime = performance.now();
      const response = await getDevicesHandler(request);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1500); // Should complete within 1.5 seconds

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.total).toBe(5000);
    });

    test("should handle CSV export of large user dataset", async () => {
      const largeUserDataset = generateLargeUserDataset(1000);
      mockUser.aggregate.mockResolvedValueOnce(largeUserDataset);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?export=csv",
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const startTime = performance.now();
      const response = await getUsersHandler(request);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(2000); // CSV export should complete within 2 seconds
      expect(response.headers.get("content-type")).toBe("text/csv");

      const csvData = await response.text();
      expect(csvData.split("\n")).toHaveLength(1001); // 1000 data rows + 1 header row
    });

    test("should handle CSV export of large device dataset", async () => {
      const largeDeviceDataset = generateLargeDeviceDataset(1000);
      mockDevice.aggregate.mockResolvedValueOnce(largeDeviceDataset);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/devices?export=csv",
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const startTime = performance.now();
      const response = await getDevicesHandler(request);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(2000); // CSV export should complete within 2 seconds
      expect(response.headers.get("content-type")).toBe("text/csv");
    });
  });

  describe("Complex Query Performance", () => {
    test("should handle complex user filtering efficiently", async () => {
      const filteredDataset = generateLargeUserDataset(100);

      mockUser.aggregate
        .mockResolvedValueOnce([{ total: 100 }])
        .mockResolvedValueOnce(filteredDataset.slice(0, 25));

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?filter_email=test&filter_role=user&filter_createdAfter=2024-01-01&sortBy=createdAt&sortDir=desc",
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const startTime = performance.now();
      const response = await getUsersHandler(request);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(800); // Complex query should complete within 800ms

      const data = await response.json();
      expect(data.success).toBe(true);
    });

    test("should handle complex device filtering efficiently", async () => {
      const filteredDataset = generateLargeDeviceDataset(50);

      mockDevice.aggregate
        .mockResolvedValueOnce([{ total: 50 }])
        .mockResolvedValueOnce(filteredDataset.slice(0, 25));

      mockUser.find.mockResolvedValue([{ _id: "user1" }]);
      mockLicense.find.mockResolvedValue([{ _id: "license1" }]);
      mockTelemetryEvent.aggregate.mockResolvedValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/devices?filter_status=active&filter_os=Windows&filter_userEmail=test&filter_licenseKey=KEY&sortBy=lastActivity&sortDir=desc",
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const startTime = performance.now();
      const response = await getDevicesHandler(request);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // Complex device query should complete within 1 second

      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe("Pagination Performance", () => {
    test("should handle deep pagination efficiently", async () => {
      const largeDataset = generateLargeUserDataset(10000);

      mockUser.aggregate
        .mockResolvedValueOnce([{ total: 10000 }])
        .mockResolvedValueOnce(largeDataset.slice(9975, 10000)); // Last page

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?page=400&pageSize=25",
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const startTime = performance.now();
      const response = await getUsersHandler(request);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // Deep pagination should complete within 1 second

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.page).toBe(400);
      expect(data.data.totalPages).toBe(400);
    });

    test("should handle large page sizes efficiently", async () => {
      const largeDataset = generateLargeUserDataset(100);

      mockUser.aggregate
        .mockResolvedValueOnce([{ total: 10000 }])
        .mockResolvedValueOnce(largeDataset);

      const request = new NextRequest(
        "http://localhost:3000/api/admin/users?page=1&pageSize=100",
        {
          headers: { authorization: `Bearer ${adminToken}` },
        }
      );

      const startTime = performance.now();
      const response = await getUsersHandler(request);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1200); // Large page size should complete within 1.2 seconds

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.rows).toHaveLength(100);
    });
  });

  describe("Memory Usage Tests", () => {
    test("should not cause memory leaks with repeated requests", async () => {
      const dataset = generateLargeUserDataset(1000);

      mockUser.aggregate
        .mockResolvedValue([{ total: 1000 }])
        .mockResolvedValue(dataset.slice(0, 25));

      const initialMemory = process.memoryUsage().heapUsed;

      // Make 50 requests
      const requests = Array.from({ length: 50 }, () => {
        const request = new NextRequest(
          "http://localhost:3000/api/admin/users",
          {
            headers: { authorization: `Bearer ${adminToken}` },
          }
        );
        return getUsersHandler(request);
      });

      await Promise.all(requests);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe("Concurrent Request Performance", () => {
    test("should handle concurrent requests efficiently", async () => {
      const dataset = generateLargeUserDataset(100);

      mockUser.aggregate
        .mockResolvedValue([{ total: 100 }])
        .mockResolvedValue(dataset.slice(0, 25));

      // Create 10 concurrent requests
      const concurrentRequests = Array.from({ length: 10 }, () => {
        const request = new NextRequest(
          "http://localhost:3000/api/admin/users",
          {
            headers: { authorization: `Bearer ${adminToken}` },
          }
        );
        return getUsersHandler(request);
      });

      const startTime = performance.now();
      const responses = await Promise.all(concurrentRequests);
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // All requests should complete
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });

      // Concurrent requests should complete within reasonable time
      expect(totalTime).toBeLessThan(3000); // 10 concurrent requests within 3 seconds
    });
  });
});
