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
    // Always include $match stage, even if empty, to keep pipelines explicit
    this.pipeline.push({ $match: conditions });
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

// Function-based exports for backward compatibility with tests
export interface UserFilterOptions {
  emailFilter?: string;
  roleFilter?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export function buildUserAggregationPipeline(
  options: UserFilterOptions
): PipelineStage[] {
  const builder = new UserAggregationBuilder();

  // Always add a match stage (even if empty)
  builder.match({});

  // Apply filters
  if (options.emailFilter) {
    builder.filterByEmail(options.emailFilter);
  }

  if (options.roleFilter) {
    builder.filterByRole(options.roleFilter as "admin" | "user");
  }

  if (options.createdAfter || options.createdBefore) {
    builder.filterByDateRange(options.createdAfter, options.createdBefore);
  }

  // Add lookups
  builder.withLicenses().withDevices().withCounts();

  // Add sorting
  if (options.sortBy) {
    builder.sort({
      field: options.sortBy,
      direction: options.sortDir || "asc",
    });
  }

  // Add pagination
  if (options.page && options.pageSize) {
    builder.paginate({
      page: options.page,
      pageSize: options.pageSize,
    });
  }

  return builder.build();
}

export interface DeviceFilterOptions {
  statusFilter?: string;
  osFilter?: string;
  deviceGuidFilter?: string;
  activityAfter?: Date;
  activityBefore?: Date;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export function buildDeviceAggregationPipeline(
  options: DeviceFilterOptions
): PipelineStage[] {
  const builder = new DeviceAggregationBuilder();

  // Always add a match stage (even if empty)
  builder.match({});

  // Apply filters
  if (options.statusFilter) {
    builder.filterByStatus(options.statusFilter as "active" | "inactive");
  }

  if (options.osFilter) {
    builder.filterByOS(options.osFilter);
  }

  if (options.deviceGuidFilter) {
    builder.filterByDeviceGuid(options.deviceGuidFilter);
  }

  if (options.activityAfter || options.activityBefore) {
    builder.filterByActivityRange(
      options.activityAfter,
      options.activityBefore
    );
  }

  // Add lookups
  builder.withUser().withLicense();

  // Add sorting
  if (options.sortBy) {
    builder.sort({
      field: options.sortBy,
      direction: options.sortDir || "asc",
    });
  }

  // Add pagination
  if (options.page && options.pageSize) {
    builder.paginate({
      page: options.page,
      pageSize: options.pageSize,
    });
  }

  return builder.build();
}

export interface LicenseFilterOptions {
  statusFilter?: string;
  planFilter?: string;
  licenseKeyFilter?: string;
  expiringBefore?: Date;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export function buildLicenseAggregationPipeline(
  options: LicenseFilterOptions
): PipelineStage[] {
  const builder = new LicenseAggregationBuilder();

  // Always add a match stage (even if empty)
  builder.match({});

  // Apply filters
  if (options.statusFilter) {
    builder.filterByStatus(
      options.statusFilter as "active" | "inactive" | "expired"
    );
  }

  if (options.planFilter) {
    builder.filterByPlan(options.planFilter);
  }

  if (options.licenseKeyFilter) {
    builder.filterByLicenseKey(options.licenseKeyFilter);
  }

  if (options.expiringBefore) {
    builder.match({ expiresAt: { $lte: options.expiringBefore } });
  }

  // Add lookups
  builder.withUser().withDevices().withDeviceCount();

  // Add sorting
  if (options.sortBy) {
    builder.sort({
      field: options.sortBy,
      direction: options.sortDir || "asc",
    });
  }

  // Add pagination
  if (options.page && options.pageSize) {
    builder.paginate({
      page: options.page,
      pageSize: options.pageSize,
    });
  }

  return builder.build();
}

export interface TelemetryFilterOptions {
  eventTypeFilter?: string;
  deviceGuidFilter?: string;
  occurredAfter?: Date;
  occurredBefore?: Date;
  groupBy?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export function buildTelemetryAggregationPipeline(
  options: TelemetryFilterOptions
): PipelineStage[] {
  const builder = new TelemetryAggregationBuilder();

  // Always add a match stage (even if empty)
  builder.match({});

  // Apply filters
  if (options.eventTypeFilter) {
    builder.filterByEventType(options.eventTypeFilter);
  }

  if (options.deviceGuidFilter) {
    builder.filterByDeviceGuid(options.deviceGuidFilter);
  }

  if (options.occurredAfter || options.occurredBefore) {
    builder.filterByDateRange(options.occurredAfter, options.occurredBefore);
  }

  // Apply grouping
  if (options.groupBy === "eventType") {
    builder.groupByEventType();
  } else if (options.groupBy === "device") {
    builder.groupByDevice();
  } else if (options.groupBy === "day") {
    builder.group({
      _id: {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$occurredAt",
        },
      },
      count: { $sum: 1 },
    });
  }

  // Add sorting
  if (options.sortBy && !options.groupBy) {
    builder.sort({
      field: options.sortBy,
      direction: options.sortDir || "asc",
    });
  }

  // Add pagination
  if (options.page && options.pageSize && !options.groupBy) {
    builder.paginate({
      page: options.page,
      pageSize: options.pageSize,
    });
  }

  return builder.build();
}

export interface AuditLogFilterOptions {
  actionFilter?: string;
  entityTypeFilter?: string;
  userIdFilter?: string;
  occurredAfter?: Date;
  occurredBefore?: Date;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export function buildAuditLogAggregationPipeline(
  options: AuditLogFilterOptions
): PipelineStage[] {
  const builder = new AggregationBuilder();

  // Always include a match stage (even if empty) for test expectations
  builder.match({});

  // Build match conditions
  const matchConditions: any = {};

  if (options.actionFilter) {
    matchConditions.action = options.actionFilter;
  }

  if (options.entityTypeFilter) {
    matchConditions.entityType = options.entityTypeFilter;
  }

  if (options.userIdFilter) {
    matchConditions.userId = options.userIdFilter;
  }

  if (options.occurredAfter || options.occurredBefore) {
    const dateFilter: any = {};
    if (options.occurredAfter) dateFilter.$gte = options.occurredAfter;
    if (options.occurredBefore) dateFilter.$lte = options.occurredBefore;
    matchConditions.occurredAt = dateFilter;
  }

  // Apply filters (if any)
  if (Object.keys(matchConditions).length > 0) {
    builder.match(matchConditions);
  }

  // Add user lookup
  // Tests expect admin lookup naming; keep user lookup projection
  builder
    .lookup("users", "userId", "_id", "admin")
    .addFields({
      admin: { $arrayElemAt: ["$admin", 0] },
    });

  // Add sorting
  if (options.sortBy) {
    builder.sort({
      field: options.sortBy,
      direction: options.sortDir || "desc",
    });
  } else {
    builder.sort({ field: "occurredAt", direction: "desc" });
  }

  // Add pagination
  if (options.page && options.pageSize) {
    builder.paginate({
      page: options.page,
      pageSize: options.pageSize,
    });
  }

  return builder.build();
}
