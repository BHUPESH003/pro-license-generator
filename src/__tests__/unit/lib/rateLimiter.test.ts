import { NextRequest } from "next/server";
import RateLimiter, { withRateLimit } from "@/lib/rateLimiter";

// Mock NextRequest
const createMockRequest = (
  ip: string = "127.0.0.1",
  path: string = "/api/test"
) => {
  return {
    ip,
    nextUrl: { pathname: path },
    headers: {
      get: jest.fn().mockReturnValue(null),
    },
  } as unknown as NextRequest;
};

describe("RateLimiter", () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      windowMs: 60000, // 1 minute
      maxRequests: 5,
    });
  });

  describe("isAllowed", () => {
    it("should allow requests within limit", async () => {
      const req = createMockRequest();

      const result = await rateLimiter.isAllowed(req);

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(5);
      expect(result.remaining).toBe(4);
    });

    it("should track multiple requests from same IP", async () => {
      const req = createMockRequest();

      // Make 5 requests (should all be allowed)
      for (let i = 0; i < 5; i++) {
        const result = await rateLimiter.isAllowed(req);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }

      // 6th request should be denied
      const result = await rateLimiter.isAllowed(req);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should differentiate between different IPs", async () => {
      const req1 = createMockRequest("192.168.1.1");
      const req2 = createMockRequest("192.168.1.2");

      // Exhaust limit for first IP
      for (let i = 0; i < 5; i++) {
        await rateLimiter.isAllowed(req1);
      }

      // First IP should be blocked
      const result1 = await rateLimiter.isAllowed(req1);
      expect(result1.allowed).toBe(false);

      // Second IP should still be allowed
      const result2 = await rateLimiter.isAllowed(req2);
      expect(result2.allowed).toBe(true);
    });

    it("should reset count after window expires", async () => {
      const shortLimiter = new RateLimiter({
        windowMs: 100, // 100ms
        maxRequests: 2,
      });

      const req = createMockRequest();

      // Exhaust limit
      await shortLimiter.isAllowed(req);
      await shortLimiter.isAllowed(req);

      // Should be blocked
      let result = await shortLimiter.isAllowed(req);
      expect(result.allowed).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be allowed again
      result = await shortLimiter.isAllowed(req);
      expect(result.allowed).toBe(true);
    });

    it("should use custom key generator", async () => {
      const customLimiter = new RateLimiter({
        windowMs: 60000,
        maxRequests: 2,
        keyGenerator: (req) => "custom-key",
      });

      const req1 = createMockRequest("192.168.1.1");
      const req2 = createMockRequest("192.168.1.2");

      // Both requests should use the same key
      await customLimiter.isAllowed(req1);
      await customLimiter.isAllowed(req2);

      // Third request should be blocked regardless of IP
      const result = await customLimiter.isAllowed(req1);
      expect(result.allowed).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("should remove expired entries", async () => {
      const shortLimiter = new RateLimiter({
        windowMs: 50, // 50ms
        maxRequests: 5,
      });

      const req = createMockRequest();

      // Make a request to create an entry
      await shortLimiter.isAllowed(req);
      expect(shortLimiter["store"]).toHaveProperty("127.0.0.1:/api/test");

      // Wait for entry to expire
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Trigger cleanup
      shortLimiter["cleanup"]();

      // Entry should be removed
      expect(shortLimiter["store"]).not.toHaveProperty("127.0.0.1:/api/test");
    });
  });
});

describe("withRateLimit", () => {
  let mockHandler: jest.Mock;
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    mockHandler = jest.fn().mockResolvedValue(new Response("OK"));
    rateLimiter = new RateLimiter({
      windowMs: 60000,
      maxRequests: 2,
    });
  });

  it("should allow requests within limit", async () => {
    const wrappedHandler = withRateLimit(rateLimiter, mockHandler);
    const req = createMockRequest();

    const response = await wrappedHandler(req);

    expect(response.status).toBe(200);
    expect(mockHandler).toHaveBeenCalledWith(req);
    expect(response.headers.get("X-RateLimit-Limit")).toBe("2");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("1");
  });

  it("should block requests exceeding limit", async () => {
    const wrappedHandler = withRateLimit(rateLimiter, mockHandler);
    const req = createMockRequest();

    // Make requests up to limit
    await wrappedHandler(req);
    await wrappedHandler(req);

    // Next request should be blocked
    const response = await wrappedHandler(req);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(response.headers.get("Retry-After")).toBeTruthy();
    expect(mockHandler).toHaveBeenCalledTimes(2); // Handler not called for blocked request
  });

  it("should handle handler errors gracefully", async () => {
    mockHandler.mockRejectedValue(new Error("Handler error"));
    const wrappedHandler = withRateLimit(rateLimiter, mockHandler);
    const req = createMockRequest();

    await expect(wrappedHandler(req)).rejects.toThrow("Handler error");
  });

  it("should continue if rate limiter fails", async () => {
    // Mock isAllowed to throw an error
    jest
      .spyOn(rateLimiter, "isAllowed")
      .mockRejectedValue(new Error("Rate limiter error"));

    const wrappedHandler = withRateLimit(rateLimiter, mockHandler);
    const req = createMockRequest();

    const response = await wrappedHandler(req);

    expect(response.status).toBe(200);
    expect(mockHandler).toHaveBeenCalledWith(req);
  });
});
