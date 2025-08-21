import {
  buildUserAggregationPipeline,
  buildDeviceAggregationPipeline,
  buildLicenseAggregationPipeline,
  buildTelemetryAggregationPipeline,
  buildAuditLogAggregationPipeline,
} from "@/lib/aggregationBuilders";

describe("MongoDB Aggregation Builders", () => {
  describe("buildUserAggregationPipeline", () => {
    it("should build basic user aggregation pipeline", () => {
      const pipeline = buildUserAggregationPipeline({});

      expect(pipeline).toContainEqual({ $match: {} });
      expect(pipeline).toContainEqual({
        $lookup: {
          from: "licenses",
          localField: "_id",
          foreignField: "userId",
          as: "licenses",
        },
      });
      expect(pipeline).toContainEqual({
        $lookup: {
          from: "devices",
          localField: "_id",
          foreignField: "userId",
          as: "devices",
        },
      });
    });

    it("should apply email filter", () => {
      const pipeline = buildUserAggregationPipeline({
        emailFilter: "test@example.com",
      });

      const matchStage = pipeline.find((stage) => stage.$match);
      expect(matchStage.$match.email).toEqual({
        $regex: "test@example.com",
        $options: "i",
      });
    });

    it("should apply role filter", () => {
      const pipeline = buildUserAggregationPipeline({
        roleFilter: "admin",
      });

      const matchStage = pipeline.find((stage) => stage.$match);
      expect(matchStage.$match.role).toBe("admin");
    });

    it("should apply date range filter", () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-12-31");

      const pipeline = buildUserAggregationPipeline({
        createdAfter: startDate,
        createdBefore: endDate,
      });

      const matchStage = pipeline.find((stage) => stage.$match);
      expect(matchStage.$match.createdAt).toEqual({
        $gte: startDate,
        $lte: endDate,
      });
    });

    it("should add sorting and pagination", () => {
      const pipeline = buildUserAggregationPipeline({
        sortBy: "email",
        sortDir: "desc",
        page: 2,
        pageSize: 10,
      });

      expect(pipeline).toContainEqual({ $sort: { email: -1 } });
      expect(pipeline).toContainEqual({ $skip: 10 });
      expect(pipeline).toContainEqual({ $limit: 10 });
    });
  });

  describe("buildDeviceAggregationPipeline", () => {
    it("should build basic device aggregation pipeline", () => {
      const pipeline = buildDeviceAggregationPipeline({});

      expect(pipeline).toContainEqual({ $match: {} });
      expect(pipeline).toContainEqual({
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      });
      expect(pipeline).toContainEqual({
        $lookup: {
          from: "licenses",
          localField: "licenseId",
          foreignField: "_id",
          as: "license",
        },
      });
    });

    it("should apply status filter", () => {
      const pipeline = buildDeviceAggregationPipeline({
        statusFilter: "active",
      });

      const matchStage = pipeline.find((stage) => stage.$match);
      expect(matchStage.$match.status).toBe("active");
    });

    it("should apply OS filter", () => {
      const pipeline = buildDeviceAggregationPipeline({
        osFilter: "Windows",
      });

      const matchStage = pipeline.find((stage) => stage.$match);
      expect(matchStage.$match.os).toEqual({
        $regex: "Windows",
        $options: "i",
      });
    });
  });

  describe("buildLicenseAggregationPipeline", () => {
    it("should build basic license aggregation pipeline", () => {
      const pipeline = buildLicenseAggregationPipeline({});

      expect(pipeline).toContainEqual({ $match: {} });
      expect(pipeline).toContainEqual({
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      });
    });

    it("should apply plan filter", () => {
      const pipeline = buildLicenseAggregationPipeline({
        planFilter: "premium",
      });

      const matchStage = pipeline.find((stage) => stage.$match);
      expect(matchStage.$match.plan).toBe("premium");
    });

    it("should apply expiration date filter", () => {
      const expirationDate = new Date("2024-12-31");

      const pipeline = buildLicenseAggregationPipeline({
        expiringBefore: expirationDate,
      });

      const matchStage = pipeline.find((stage) => stage.$match);
      expect(matchStage.$match.expiresAt).toEqual({
        $lte: expirationDate,
      });
    });
  });

  describe("buildTelemetryAggregationPipeline", () => {
    it("should build basic telemetry aggregation pipeline", () => {
      const pipeline = buildTelemetryAggregationPipeline({});

      expect(pipeline).toContainEqual({ $match: {} });
    });

    it("should apply event type filter", () => {
      const pipeline = buildTelemetryAggregationPipeline({
        eventTypeFilter: "user_action",
      });

      const matchStage = pipeline.find((stage) => stage.$match);
      expect(matchStage.$match.eventType).toBe("user_action");
    });

    it("should apply date range filter", () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      const pipeline = buildTelemetryAggregationPipeline({
        occurredAfter: startDate,
        occurredBefore: endDate,
      });

      const matchStage = pipeline.find((stage) => stage.$match);
      expect(matchStage.$match.occurredAt).toEqual({
        $gte: startDate,
        $lte: endDate,
      });
    });

    it("should group by time intervals", () => {
      const pipeline = buildTelemetryAggregationPipeline({
        groupBy: "day",
      });

      const groupStage = pipeline.find((stage) => stage.$group);
      expect(groupStage).toBeDefined();
      expect(groupStage.$group._id).toEqual({
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$occurredAt",
        },
      });
    });
  });

  describe("buildAuditLogAggregationPipeline", () => {
    it("should build basic audit log aggregation pipeline", () => {
      const pipeline = buildAuditLogAggregationPipeline({});

      expect(pipeline).toContainEqual({ $match: {} });
      expect(pipeline).toContainEqual({
        $lookup: {
          from: "users",
          localField: "adminId",
          foreignField: "_id",
          as: "admin",
        },
      });
    });

    it("should apply action filter", () => {
      const pipeline = buildAuditLogAggregationPipeline({
        actionFilter: "USER_CREATE",
      });

      const matchStage = pipeline.find((stage) => stage.$match);
      expect(matchStage.$match.action).toBe("USER_CREATE");
    });

    it("should apply entity type filter", () => {
      const pipeline = buildAuditLogAggregationPipeline({
        entityTypeFilter: "User",
      });

      const matchStage = pipeline.find((stage) => stage.$match);
      expect(matchStage.$match.entityType).toBe("User");
    });
  });
});
