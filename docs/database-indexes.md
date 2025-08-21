# Database Indexes for Admin Panel

This document outlines the database indexes implemented for optimal admin panel query performance.

## License Collection Indexes

### Single Field Indexes

- `{ licenseKey: 1 }` - Unique index for license key lookups
- `{ status: 1 }` - For filtering by license status (active/inactive)
- `{ plan: 1 }` - For filtering by subscription plan
- `{ mode: 1 }` - For filtering by license mode (subscription/payment)
- `{ userId: 1 }` - For user association queries
- `{ purchaseDate: -1 }` - For sorting by purchase date (descending)
- `{ expiryDate: -1 }` - For sorting by expiry date (descending)

### Compound Indexes

- `{ status: 1, purchaseDate: -1 }` - Efficient filtering by status with date sorting
- `{ plan: 1, mode: 1 }` - Combined plan and mode filtering
- `{ userId: 1, status: 1 }` - User-specific license status queries

## Device Collection Indexes

### Single Field Indexes

- `{ deviceGuid: 1 }` - Unique sparse index for device GUID lookups
- `{ userId: 1 }` - For user association queries
- `{ licenseId: 1 }` - For license association queries
- `{ lastActivity: -1 }` - For sorting by last activity (descending)
- `{ status: 1 }` - For filtering by device status
- `{ os: 1 }` - For filtering by operating system
- `{ name: 1 }` - For device name searches

### Compound Indexes

- `{ status: 1, lastActivity: -1 }` - Status filtering with activity sorting
- `{ userId: 1, status: 1 }` - User-specific device status queries
- `{ os: 1, status: 1 }` - OS-specific status filtering

## TelemetryEvent Collection Indexes

### Single Field Indexes

- `{ deviceGuid: 1 }` - For device-specific telemetry queries
- `{ eventType: 1 }` - For event type filtering
- `{ occurredAt: 1 }` - For time-based queries
- `{ idempotencyKey: 1 }` - Unique sparse index for deduplication

### Compound Indexes

- `{ userId: 1, occurredAt: -1 }` - User-specific time-series queries
- `{ licenseId: 1, occurredAt: -1 }` - License-specific time-series queries
- `{ deviceGuid: 1, occurredAt: -1 }` - Device-specific time-series queries
- `{ eventType: 1, occurredAt: -1 }` - Event type with time sorting
- `{ userId: 1, eventType: 1, occurredAt: -1 }` - Complex user event queries
- `{ deviceGuid: 1, eventType: 1, occurredAt: -1 }` - Complex device event queries

## AdminAudit Collection Indexes

### Single Field Indexes

- `{ createdAt: -1 }` - For chronological audit trail sorting

### Compound Indexes

- `{ actorUserId: 1, createdAt: -1 }` - Actor-specific audit queries with time sorting
- `{ entityType: 1, entityId: 1 }` - Entity-specific audit lookups
- `{ entityType: 1, createdAt: -1 }` - Entity type filtering with time sorting
- `{ action: 1, createdAt: -1 }` - Action-specific audit queries with time sorting
- `{ actorUserId: 1, entityType: 1, createdAt: -1 }` - Complex audit queries

## Performance Considerations

### Index Usage Patterns

1. **Filtering**: Single field indexes support equality and range queries
2. **Sorting**: Descending indexes (-1) optimize recent-first sorting
3. **Compound Queries**: Multi-field indexes support complex admin filters
4. **Uniqueness**: Unique indexes ensure data integrity

### Query Optimization

- Compound indexes are ordered by selectivity (most selective fields first)
- Time-based fields use descending order for recent-first queries
- Sparse indexes are used for optional fields to save space
- Text search capabilities can be added later if needed

### Monitoring

- Use `db.collection.getIndexes()` to verify index creation
- Monitor query performance with `explain()` plans
- Track index usage with MongoDB profiler
- Consider index maintenance during high-write periods

## Verification

Run the index verification script to ensure all indexes are properly created:

```bash
npm run verify-indexes
```

This script will:

1. Connect to the MongoDB database
2. Check all model index definitions
3. Verify required indexes are present
4. Report any missing indexes
