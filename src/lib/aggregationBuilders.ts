import { PipelineStage } from "mongoose";

export interface FilterOptions {
  [key: string]: any;
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

/**
 * Base aggregation builder for MongoDB queries
 */
export class AggregationBuilder {
  private pipeline: PipelineStage[] = [];

  /**
   * Add a match stage to filter documents
   */
  match(conditions: FilterOptions): this {
    if (Object.keys(conditions).length > 0) {
      this.pipeline.push({ $match: conditions });
    }
    return this;
  }

  /**
   * Add a lookup stage to join with another collection
   */
  lookup(
    from: string,
    localField: string,
    foreignField: string,
    as: string,
    pipeline?: PipelineStage[]
  ): this {
    const lookupStage: any = {
      $lookup: {
        from,
        localField,
        foreignField,
        as,
      },
    };

    if (pipeline) {
      lookupStage.$lookup.pipeline = pipeline;
    }

    this.pipeline.push(lookupStage);
    return this;
  }

  /**
   * Add fields to the aggregation
   */
  addFields(fields: Record<string, any>): this {
    this.pipeline.push({ $addFields: fields });
    return this;
  }

  /**
   * Project specific fields
   */
  project(fields: Record<string, any>): this {
    this.pipeline.push({ $project: fields });
    return this;
  }

  /**
   * Sort documents
   */
  sort(sortOptions: SortOptions): this {
    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortOptions.field] = sortOptions.direction === "desc" ? -1 : 1;
    this.pipeline.push({ $sort: sortObj });
    return this;
  }

  /**
   * Add pagination (skip and limit)
   */
  paginate(options: PaginationOptions): this {
    const skip = (options.page - 1) * options.pageSize;
    this.pipeline.push({ $skip: skip });
    this.pipeline.push({ $limit: options.pageSize });
    return this;
  }

  /**
   * Group documents
   */
  group(groupBy: Record<string, any>): this {
    this.pipeline.push({ $group: groupBy });
    return this;
  }

  /**
   * Count documents
   */
  count(field: string = "total"): this {
    this.pipeline.push({ $count: field });
    return this;
  }

  /**
   * Get the built pipeline
   */
  build(): PipelineStage[] {
    return [...this.pipeline];
  }

  /**
   * Reset the pipeline
   */
  reset(): this {
    this.pipeline = [];
    return this;
  }
}

/**
 * User aggregation builder with specific user-related methods
 */
export class UserAggregationBuilder extends AggregationBuilder {
  /**
   * Join with licenses collection
   */
  withLicenses(): this {
    return this.lookup("licenses", "_id", "userId", "licenses");
  }

  /**
   * Join with devices collection
   */
  withDevices(): this {
    return this.lookup("devices", "_id", "userId", "devices");
  }

  /**
   * Add license and device counts
   */
  withCounts(): this {
    return this.addFields({
      licenseCount: { $size: "$licenses" },
      deviceCount: { $size: "$devices" },
    });
  }

  /**
   * Filter by role
   */
  filterByRole(role: "admin" | "user"): this {
    if (role === "admin") {
      return this.match({ role: "admin" });
    } else {
      return this.match({
        $or: [{ role: { $exists: false } }, { role: { $ne: "admin" } }],
      });
    }
  }

  /**
   * Filter by email pattern
   */
  filterByEmail(emailPattern: string): this {
    return this.match({
      email: { $regex: emailPattern, $options: "i" },
    });
  }

  /**
   * Filter by creation date range
   */
  filterByDateRange(startDate?: Date, endDate?: Date): this {
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = startDate;
    if (endDate) dateFilter.$lte = endDate;

    if (Object.keys(dateFilter).length > 0) {
      return this.match({ createdAt: dateFilter });
    }
    return this;
  }
}

/**
 * Device aggregation builder with device-specific methods
 */
export class DeviceAggregationBuilder extends AggregationBuilder {
  /**
   * Join with users collection
   */
  withUser(): this {
    return this.lookup("users", "userId", "_id", "user", [
      { $project: { email: 1, name: 1 } },
    ]).addFields({
      user: { $arrayElemAt: ["$user", 0] },
    });
  }

  /**
   * Join with licenses collection
   */
  withLicense(): this {
    return this.lookup("licenses", "licenseId", "_id", "license", [
      { $project: { licenseKey: 1, status: 1, plan: 1 } },
    ]).addFields({
      license: { $arrayElemAt: ["$license", 0] },
    });
  }

  /**
   * Filter by status
   */
  filterByStatus(status: "active" | "inactive"): this {
    return this.match({ status });
  }

  /**
   * Filter by OS
   */
  filterByOS(osPattern: string): this {
    return this.match({
      os: { $regex: osPattern, $options: "i" },
    });
  }

  /**
   * Filter by device GUID
   */
  filterByDeviceGuid(guidPattern: string): this {
    return this.match({
      deviceGuid: { $regex: guidPattern, $options: "i" },
    });
  }

  /**
   * Filter by last activity date range
   */
  filterByActivityRange(startDate?: Date, endDate?: Date): this {
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = startDate;
    if (endDate) dateFilter.$lte = endDate;

    if (Object.keys(dateFilter).length > 0) {
      return this.match({ lastActivity: dateFilter });
    }
    return this;
  }
}

/**
 * License aggregation builder with license-specific methods
 */
export class LicenseAggregationBuilder extends AggregationBuilder {
  /**
   * Join with users collection
   */
  withUser(): this {
    return this.lookup("users", "userId", "_id", "user", [
      { $project: { email: 1, name: 1 } },
    ]).addFields({
      user: { $arrayElemAt: ["$user", 0] },
    });
  }

  /**
   * Join with devices collection
   */
  withDevices(): this {
    return this.lookup("devices", "_id", "licenseId", "devices");
  }

  /**
   * Add device count
   */
  withDeviceCount(): this {
    return this.addFields({
      deviceCount: { $size: "$devices" },
    });
  }

  /**
   * Filter by status
   */
  filterByStatus(status: "active" | "inactive" | "expired"): this {
    return this.match({ status });
  }

  /**
   * Filter by plan
   */
  filterByPlan(plan: string): this {
    return this.match({ plan });
  }

  /**
   * Filter by license key pattern
   */
  filterByLicenseKey(keyPattern: string): this {
    return this.match({
      licenseKey: { $regex: keyPattern, $options: "i" },
    });
  }
}

/**
 * Telemetry aggregation builder for analytics
 */
export class TelemetryAggregationBuilder extends AggregationBuilder {
  /**
   * Filter by event type
   */
  filterByEventType(eventType: string): this {
    return this.match({ eventType });
  }

  /**
   * Filter by device GUID
   */
  filterByDeviceGuid(deviceGuid: string): this {
    return this.match({ deviceGuid });
  }

  /**
   * Filter by date range
   */
  filterByDateRange(startDate?: Date, endDate?: Date): this {
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = startDate;
    if (endDate) dateFilter.$lte = endDate;

    if (Object.keys(dateFilter).length > 0) {
      return this.match({ occurredAt: dateFilter });
    }
    return this;
  }

  /**
   * Group by event type and count
   */
  groupByEventType(): this {
    return this.group({
      _id: "$eventType",
      count: { $sum: 1 },
      lastOccurred: { $max: "$occurredAt" },
    });
  }

  /**
   * Group by device and get stats
   */
  groupByDevice(): this {
    return this.group({
      _id: "$deviceGuid",
      totalEvents: { $sum: 1 },
      eventTypes: { $addToSet: "$eventType" },
      lastEvent: { $max: "$occurredAt" },
    });
  }
}
