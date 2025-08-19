import {
  AggregationBuilder,
  UserAggregationBuilder,
  DeviceAggregationBuilder,
  LicenseAggregationBuilder,
  TelemetryAggregationBuilder,
} from "@/lib/aggregationBuilders";

describe("AggregationBuilder", () => {
  let builder: AggregationBuilder;

  beforeEach(() => {
    builder = new AggregationBuilder();
  });

  describe("match", () => {
    it("should add match stage with conditions", () => {
      const conditions = { status: "active", role: "admin" };
      builder.match(conditions);

      const pipeline = builder.build();
      expect(pipeline).toHaveLength(1);
      expect(pipeline[0]).toEqual({ $match: conditions });
    });

    it("should not add match stage for empty conditions", () => {
      builder.match({});

      const pipeline = builder.build();
      expect(pipeline).toHaveLength(0);
    });
  });

  describe("lookup", () => {
    it("should add lookup stage without pipeline", () => {
      builder.lookup("users", "userId", "_id", "user");

      const pipeline = builder.build();
      expect(pipeline).toHaveLength(1);
      expect(pipeline[0]).toEqual({
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      });
    });

    it("should add lookup stage with pipeline", () => {
      const subPipeline = [{ $project: { name: 1, email: 1 } }];
      builder.lookup("users", "userId", "_id", "user", subPipeline);

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
          pipeline: subPipeline,
        },
      });
    });
  });

  describe("sort", () => {
    it("should add sort stage with ascending order", () => {
      builder.sort({ field: "createdAt", direction: "asc" });

      const pipeline = builder.build();
      expect(pipeline).toHaveLength(1);
      expect(pipeline[0]).toEqual({ $sort: { createdAt: 1 } });
    });

    it("should add sort stage with descending order", () => {
      builder.sort({ field: "lastActivity", direction: "desc" });

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({ $sort: { lastActivity: -1 } });
    });
  });

  describe("paginate", () => {
    it("should add skip and limit stages", () => {
      builder.paginate({ page: 2, pageSize: 10 });

      const pipeline = builder.build();
      expect(pipeline).toHaveLength(2);
      expect(pipeline[0]).toEqual({ $skip: 10 });
      expect(pipeline[1]).toEqual({ $limit: 10 });
    });

    it("should calculate skip correctly for first page", () => {
      builder.paginate({ page: 1, pageSize: 25 });

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({ $skip: 0 });
      expect(pipeline[1]).toEqual({ $limit: 25 });
    });
  });

  describe("addFields", () => {
    it("should add addFields stage", () => {
      const fields = {
        fullName: { $concat: ["$firstName", " ", "$lastName"] },
      };
      builder.addFields(fields);

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({ $addFields: fields });
    });
  });

  describe("project", () => {
    it("should add project stage", () => {
      const projection = { name: 1, email: 1, password: 0 };
      builder.project(projection);

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({ $project: projection });
    });
  });

  describe("group", () => {
    it("should add group stage", () => {
      const groupBy = { _id: "$status", count: { $sum: 1 } };
      builder.group(groupBy);

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({ $group: groupBy });
    });
  });

  describe("count", () => {
    it("should add count stage with default field name", () => {
      builder.count();

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({ $count: "total" });
    });

    it("should add count stage with custom field name", () => {
      builder.count("userCount");

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({ $count: "userCount" });
    });
  });

  describe("chaining", () => {
    it("should support method chaining", () => {
      const pipeline = builder
        .match({ status: "active" })
        .sort({ field: "createdAt", direction: "desc" })
        .paginate({ page: 1, pageSize: 10 })
        .build();

      expect(pipeline).toHaveLength(4);
      expect(pipeline[0]).toEqual({ $match: { status: "active" } });
      expect(pipeline[1]).toEqual({ $sort: { createdAt: -1 } });
      expect(pipeline[2]).toEqual({ $skip: 0 });
      expect(pipeline[3]).toEqual({ $limit: 10 });
    });
  });

  describe("reset", () => {
    it("should reset the pipeline", () => {
      builder
        .match({ status: "active" })
        .sort({ field: "name", direction: "asc" });
      expect(builder.build()).toHaveLength(2);

      builder.reset();
      expect(builder.build()).toHaveLength(0);
    });
  });
});

describe("UserAggregationBuilder", () => {
  let builder: UserAggregationBuilder;

  beforeEach(() => {
    builder = new UserAggregationBuilder();
  });

  describe("withLicenses", () => {
    it("should add licenses lookup", () => {
      builder.withLicenses();

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({
        $lookup: {
          from: "licenses",
          localField: "_id",
          foreignField: "userId",
          as: "licenses",
        },
      });
    });
  });

  describe("withDevices", () => {
    it("should add devices lookup", () => {
      builder.withDevices();

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({
        $lookup: {
          from: "devices",
          localField: "_id",
          foreignField: "userId",
          as: "devices",
        },
      });
    });
  });

  describe("withCounts", () => {
    it("should add license and device counts", () => {
      builder.withCounts();

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({
        $addFields: {
          licenseCount: { $size: "$licenses" },
          deviceCount: { $size: "$devices" },
        },
      });
    });
  });

  describe("filterByRole", () => {
    it("should filter by admin role", () => {
      builder.filterByRole("admin");

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({ $match: { role: "admin" } });
    });

    it("should filter by user role", () => {
      builder.filterByRole("user");

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({
        $match: {
          $or: [{ role: { $exists: false } }, { role: { $ne: "admin" } }],
        },
      });
    });
  });

  describe("filterByEmail", () => {
    it("should add email filter with regex", () => {
      builder.filterByEmail("john");

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({
        $match: {
          email: { $regex: "john", $options: "i" },
        },
      });
    });
  });

  describe("filterByDateRange", () => {
    it("should filter by start date only", () => {
      const startDate = new Date("2024-01-01");
      builder.filterByDateRange(startDate);

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({
        $match: {
          createdAt: { $gte: startDate },
        },
      });
    });

    it("should filter by end date only", () => {
      const endDate = new Date("2024-12-31");
      builder.filterByDateRange(undefined, endDate);

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({
        $match: {
          createdAt: { $lte: endDate },
        },
      });
    });

    it("should filter by date range", () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-12-31");
      builder.filterByDateRange(startDate, endDate);

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      });
    });

    it("should not add filter when no dates provided", () => {
      builder.filterByDateRange();

      const pipeline = builder.build();
      expect(pipeline).toHaveLength(0);
    });
  });
});

describe("DeviceAggregationBuilder", () => {
  let builder: DeviceAggregationBuilder;

  beforeEach(() => {
    builder = new DeviceAggregationBuilder();
  });

  describe("withUser", () => {
    it("should add user lookup with projection", () => {
      builder.withUser();

      const pipeline = builder.build();
      expect(pipeline).toHaveLength(2);
      expect(pipeline[0]).toEqual({
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
          pipeline: [{ $project: { email: 1, name: 1 } }],
        },
      });
      expect(pipeline[1]).toEqual({
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      });
    });
  });

  describe("filterByStatus", () => {
    it("should filter by active status", () => {
      builder.filterByStatus("active");

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({ $match: { status: "active" } });
    });
  });

  describe("filterByOS", () => {
    it("should filter by OS pattern", () => {
      builder.filterByOS("Windows");

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({
        $match: {
          os: { $regex: "Windows", $options: "i" },
        },
      });
    });
  });
});

describe("TelemetryAggregationBuilder", () => {
  let builder: TelemetryAggregationBuilder;

  beforeEach(() => {
    builder = new TelemetryAggregationBuilder();
  });

  describe("groupByEventType", () => {
    it("should group by event type with count and last occurred", () => {
      builder.groupByEventType();

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({
        $group: {
          _id: "$eventType",
          count: { $sum: 1 },
          lastOccurred: { $max: "$occurredAt" },
        },
      });
    });
  });

  describe("groupByDevice", () => {
    it("should group by device with stats", () => {
      builder.groupByDevice();

      const pipeline = builder.build();
      expect(pipeline[0]).toEqual({
        $group: {
          _id: "$deviceGuid",
          totalEvents: { $sum: 1 },
          eventTypes: { $addToSet: "$eventType" },
          lastEvent: { $max: "$occurredAt" },
        },
      });
    });
  });
});
