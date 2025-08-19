# Admin Telemetry API Endpoints

This directory contains the telemetry explorer API endpoints for the admin panel.

## Endpoints

### GET /api/admin/telemetry/events

Main telemetry events endpoint with comprehensive filtering and export capabilities.

**Features:**

- Server-side pagination (default 25 items per page, max 100)
- Flexible filtering by:
  - Device GUID
  - License key
  - User email
  - Event type
  - Date range (occurredAfter/occurredBefore)
  - App version
  - OS
  - Session ID
- CSV export functionality (limited to 10k records)
- Sorting by any field
- Full admin authentication required

**Query Parameters:**

- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 25, max: 100)
- `sortBy` - Field to sort by (default: occurredAt)
- `sortDir` - Sort direction: asc/desc (default: desc)
- `filter_deviceGuid` - Filter by device GUID (regex)
- `filter_licenseKey` - Filter by license key (regex)
- `filter_userEmail` - Filter by user email (regex)
- `filter_eventType` - Filter by event type (regex)
- `filter_occurredAfter` - Filter events after date (ISO string)
- `filter_occurredBefore` - Filter events before date (ISO string)
- `filter_appVersion` - Filter by app version (regex)
- `filter_os` - Filter by OS (regex)
- `filter_sessionId` - Filter by session ID (regex)
- `export=csv` - Export results as CSV

### GET /api/admin/telemetry/summary

Telemetry summary endpoint for trend analysis and volume charts.

**Features:**

- Volume over time with configurable granularity (hour/day/week)
- Event type statistics with percentages
- Device statistics (total, active, top devices)
- User statistics (total, active, top users)
- Same filtering capabilities as events endpoint
- Optimized aggregation pipelines for performance

**Query Parameters:**

- `from` - Start date (ISO string, default: 30 days ago)
- `to` - End date (ISO string, default: now)
- `granularity` - Time granularity: hour/day/week (default: day)
- All filter parameters from events endpoint

### GET /api/admin/telemetry/stats

Quick telemetry statistics endpoint for dashboard KPIs.

**Features:**

- Total events count
- Events today/this week/this month
- Unique devices today/this week/this month
- Unique users today/this week/this month
- Top 10 event types (last 30 days)
- Recent activity (last 7 days, daily breakdown)
- Optimized for dashboard performance

**No query parameters required**

## Authentication

All endpoints require admin authentication using the `withAdminAuth` wrapper. Requests must include:

- `Authorization: Bearer <jwt_token>` header
- JWT token must contain admin role claims

## Response Format

All endpoints return standardized JSON responses:

```typescript
// Success response
{
  success: true,
  data: {
    // Endpoint-specific data
  }
}

// Error response
{
  success: false,
  message: "Error description",
  error?: "Development error details" // Only in development
}
```

## Performance Considerations

- Events endpoint uses MongoDB aggregation pipelines for efficient joins
- Summary endpoint includes caching-friendly aggregations
- Stats endpoint is optimized for frequent dashboard requests
- CSV exports are limited to 10,000 records for performance
- All endpoints use proper MongoDB indexes for query optimization

## Requirements Satisfied

This implementation satisfies requirements:

- **6.1**: Flexible querying by deviceGuid, licenseKey, user email, date range, and eventType
- **6.2**: Telemetry results display with JSON metadata viewer support
- **6.4**: Telemetry trend analysis and volume charts via summary endpoint
- **6.5**: Full telemetry export functionality with comprehensive data access
