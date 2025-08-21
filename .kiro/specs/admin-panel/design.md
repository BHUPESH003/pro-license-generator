# Design Document

## Overview

The MyCleanOne Admin Panel is a comprehensive administrative interface built on top of the existing Next.js application architecture. It provides a single admin role with full access to manage users, licenses, devices, telemetry data, and generate business reports. The admin panel is designed as a separate section under `/app/admin/*` that integrates seamlessly with the existing authentication system while maintaining complete isolation from customer-facing functionality.

### Key Design Principles

- **Separation of Concerns**: Admin functionality is completely isolated from customer flows
- **Security First**: Role-based authentication with comprehensive audit logging
- **Performance Optimized**: Server-side operations for all data tables and aggregations
- **User Experience**: Consistent UI patterns with the existing dashboard design
- **Scalability**: Efficient MongoDB aggregations and proper indexing for large datasets

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                      │
├─────────────────────────────────────────────────────────────┤
│  Customer Routes (/dashboard/*)  │  Admin Routes (/admin/*) │
├─────────────────────────────────────────────────────────────┤
│           Shared Authentication Middleware                  │
├─────────────────────────────────────────────────────────────┤
│  Customer APIs (/api/*)          │  Admin APIs (/api/admin/*) │
├─────────────────────────────────────────────────────────────┤
│                    MongoDB Database                         │
│  Users │ Licenses │ Devices │ TelemetryEvents │ AdminAudit │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 15 App Router, React 19, TypeScript
- **UI Framework**: Tailwind CSS v4 + shadcn/ui components
- **Data Tables**: AG Grid (server-side mode)
- **Charts**: Recharts (donut, line, area, stacked bar)
- **State Management**: Redux Toolkit + RTK Query
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with role-based access control

## Components and Interfaces

### Core UI Components

#### KPICard Component

```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  delta?: {
    value: number;
    type: "increase" | "decrease";
    period: string;
  };
  tooltip?: string;
  onClick?: () => void;
}
```

#### TrendChart Component

```typescript
interface TrendChartProps {
  data: Array<{ date: string; value: number; label?: string }>;
  type: "line" | "area";
  timeRange: "7d" | "30d" | "90d";
  onTimeRangeChange: (range: string) => void;
  height?: number;
}
```

#### DonutChart Component

```typescript
interface DonutChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  title: string;
  centerLabel?: string;
  height?: number;
}
```

#### DataTable Component

```typescript
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  endpoint: string;
  filters?: FilterConfig[];
  defaultSort?: { field: string; direction: "asc" | "desc" };
  actions?: ActionConfig<T>[];
  exportEnabled?: boolean;
}
```

#### EntityDrawer Component

```typescript
interface EntityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant: "primary" | "secondary" | "danger";
  }>;
}
```

#### ConfirmDialog Component

```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  requireTypedConfirmation?: boolean;
  expectedText?: string;
  variant: "danger" | "warning" | "info";
}
```

### Admin Layout Structure

```typescript
// /app/admin/layout.tsx
interface AdminLayoutProps {
  children: React.ReactNode;
}

// Navigation structure
const adminNavigation = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/licenses", label: "Licenses", icon: Key },
  { href: "/admin/devices", label: "Devices", icon: Smartphone },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/telemetry", label: "Telemetry", icon: Activity },
  { href: "/admin/reports", label: "Reports", icon: BarChart },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];
```

## Data Models

### Enhanced User Model

```typescript
interface IUser extends Document {
  email: string;
  password?: string;
  license?: ILicense | mongoose.Types.ObjectId;
  name?: string;
  phone?: string;
  address?: UserAddress;
  stripeCustomerId?: string;
  // New admin fields
  role?: "admin";
  lastSeenAt?: Date;
}
```

### Enhanced License Model

```typescript
interface ILicense extends Document {
  licenseKey: string;
  userId: mongoose.Types.ObjectId;
  deviceId: string;
  status: "active" | "inactive";
  purchaseDate: Date;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  expiryDate: Date;
  plan: string;
  // New admin fields
  mode?: "subscription" | "payment";
  planType?: "monthly" | "quarterly" | "yearly";
}
```

### Enhanced Device Model

```typescript
interface IDevice extends Document {
  name: string;
  os: string;
  deviceGuid?: string;
  licenseId: mongoose.Types.ObjectId | ILicense;
  userId: mongoose.Types.ObjectId;
  lastActivity: Date;
  // New admin fields
  status?: "active" | "inactive";
}
```

### New AdminAudit Model

```typescript
interface IAdminAudit extends Document {
  actorUserId: mongoose.Types.ObjectId;
  action: string;
  entityType: "user" | "license" | "device" | "settings";
  entityId: string;
  payload: Record<string, any>;
  createdAt: Date;
}
```

### Database Indexes

```typescript
// License indexes
LicenseSchema.index({ licenseKey: 1 }, { unique: true });
LicenseSchema.index({ status: 1 });
LicenseSchema.index({ plan: 1 });
LicenseSchema.index({ mode: 1 });
LicenseSchema.index({ userId: 1 });
LicenseSchema.index({ purchaseDate: -1 });
LicenseSchema.index({ expiryDate: -1 });

// Device indexes
DeviceSchema.index({ deviceGuid: 1 }, { unique: true, sparse: true });
DeviceSchema.index({ userId: 1 });
DeviceSchema.index({ licenseId: 1 });
DeviceSchema.index({ lastActivity: -1 });
DeviceSchema.index({ status: 1 });

// TelemetryEvent indexes (existing + new)
TelemetryEventSchema.index({ deviceGuid: 1, occurredAt: -1 });
TelemetryEventSchema.index({ licenseId: 1, occurredAt: -1 });
TelemetryEventSchema.index({ eventType: 1, occurredAt: -1 });
TelemetryEventSchema.index(
  { idempotencyKey: 1 },
  { unique: true, sparse: true }
);

// AdminAudit indexes
AdminAuditSchema.index({ actorUserId: 1, createdAt: -1 });
AdminAuditSchema.index({ entityType: 1, entityId: 1 });
AdminAuditSchema.index({ createdAt: -1 });
```

## Error Handling

### Standard Error Response Format

```typescript
interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: Record<string, any>;
}

interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}
```

### Error Codes

- `AUTHENTICATION_REQUIRED`: User not authenticated
- `AUTHORIZATION_FAILED`: Insufficient permissions
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `OPERATION_FAILED`: General operation failure
- `RATE_LIMIT_EXCEEDED`: Too many requests

### Error Handling Middleware

```typescript
function withErrorHandling(handler: NextApiHandler) {
  return async (req: NextRequest, res: NextResponse) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof ValidationError) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details: error.details,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Internal server error",
          code: "OPERATION_FAILED",
        },
        { status: 500 }
      );
    }
  };
}
```

## Testing Strategy

### Unit Tests

- **Model Validation**: Test all Mongoose model validations and methods
- **Aggregation Builders**: Test MongoDB aggregation pipeline builders
- **Utility Functions**: Test date formatting, data transformation utilities
- **Component Logic**: Test React component state management and event handlers

### Integration Tests

- **API Endpoints**: Test all admin API routes with various scenarios
- **Database Operations**: Test CRUD operations with real MongoDB instance
- **Authentication Flow**: Test admin authentication and authorization
- **Aggregation Queries**: Test dashboard metrics with seeded data

### End-to-End Tests (Playwright)

- **Admin Login Flow**: Complete authentication process
- **Dashboard Loading**: Verify all metrics and charts load correctly
- **Table Operations**: Test filtering, sorting, pagination, and exports
- **CRUD Operations**: Test license/device/user management actions
- **Audit Logging**: Verify all admin actions are properly logged

### Test Data Setup

```typescript
// Test data factory for seeding
interface TestDataFactory {
  createUsers(count: number): Promise<IUser[]>;
  createLicenses(users: IUser[], count: number): Promise<ILicense[]>;
  createDevices(licenses: ILicense[], count: number): Promise<IDevice[]>;
  createTelemetryEvents(
    devices: IDevice[],
    count: number
  ): Promise<ITelemetryEvent[]>;
}
```

### Performance Testing

- **Load Testing**: Test admin APIs under concurrent user load
- **Database Performance**: Verify aggregation query performance with large datasets
- **Memory Usage**: Monitor memory consumption during large data exports
- **Response Times**: Ensure all API responses are under acceptable thresholds

## Security Considerations

### Authentication & Authorization

- **JWT Token Validation**: Verify admin role in all protected routes
- **Session Management**: Secure refresh token handling
- **Role Verification**: Middleware to check admin permissions

### Data Protection

- **Input Validation**: Comprehensive validation for all API inputs
- **SQL Injection Prevention**: Use parameterized queries and Mongoose ODM
- **XSS Prevention**: Sanitize all user inputs and outputs
- **CSRF Protection**: Implement CSRF tokens for state-changing operations

### Audit & Compliance

- **Action Logging**: Log all administrative actions with full context
- **Data Access Logging**: Track all data access and exports
- **Retention Policies**: Implement audit log retention and archival
- **Compliance Reporting**: Generate compliance reports for security audits

### Rate Limiting

```typescript
// Admin-specific rate limiting
const adminRateLimit = {
  "/api/admin/dashboard": { requests: 60, window: "1m" },
  "/api/admin/licenses": { requests: 100, window: "1m" },
  "/api/admin/devices": { requests: 100, window: "1m" },
  "/api/admin/users": { requests: 50, window: "1m" },
  "/api/admin/telemetry": { requests: 30, window: "1m" },
  "/api/admin/reports": { requests: 10, window: "1m" },
};
```

## API Design

### Authentication Middleware

```typescript
// Enhanced middleware for admin routes
async function requireAdmin(
  req: NextRequest
): Promise<{ userId: string; email: string }> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) {
    throw new Error("No token provided");
  }

  const decoded = await verifyJWT(token);

  // Verify admin role
  const user = await User.findById(decoded.userId);
  if (!user || user.role !== "admin") {
    throw new Error("Insufficient permissions");
  }

  return { userId: decoded.userId, email: decoded.email };
}
```

### Dashboard Metrics API

```typescript
// GET /api/admin/metrics/overview
interface DashboardMetricsResponse {
  users: {
    total: number;
    newInRange: number;
  };
  licenses: {
    active: number;
    inactive: number;
  };
  plans: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  modes: {
    subscription: number;
    payment: number;
  };
  timeseries: {
    dailyActiveDevices: Array<{ date: string; count: number }>;
    dailyScans: Array<{ date: string; count: number }>;
  };
}
```

### Server-Side Table API Pattern

```typescript
// Common interface for all list endpoints
interface TableRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  filters?: Record<string, any>;
}

interface TableResponse<T> {
  success: true;
  data: {
    rows: T[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

### MongoDB Aggregation Pipelines

#### Daily Active Devices

```typescript
const dailyActiveDevicesAggregation = [
  {
    $match: {
      occurredAt: { $gte: fromDate, $lte: toDate },
    },
  },
  {
    $group: {
      _id: {
        day: { $dateTrunc: { date: "$occurredAt", unit: "day" } },
        device: "$deviceGuid",
      },
    },
  },
  {
    $group: {
      _id: "$_id.day",
      activeDevices: { $sum: 1 },
    },
  },
  {
    $sort: { _id: 1 },
  },
];
```

#### Plan Mix Analysis

```typescript
const planMixAggregation = [
  {
    $match: {
      purchaseDate: { $gte: fromDate, $lte: toDate },
    },
  },
  {
    $group: {
      _id: {
        month: { $dateTrunc: { date: "$purchaseDate", unit: "month" } },
        plan: "$plan",
        mode: "$mode",
      },
      count: { $sum: 1 },
    },
  },
  {
    $group: {
      _id: "$_id.month",
      buckets: {
        $push: {
          plan: "$_id.plan",
          mode: "$_id.mode",
          count: "$count",
        },
      },
    },
  },
  {
    $sort: { _id: 1 },
  },
];
```

## Frontend Architecture

### Redux Store Structure

```typescript
// Store configuration
interface AdminState {
  auth: {
    user: AdminUser | null;
    isAuthenticated: boolean;
  };
  dashboard: {
    metrics: DashboardMetrics | null;
    timeRange: "7d" | "30d" | "90d";
    loading: boolean;
  };
  licenses: {
    data: TableData<License>;
    filters: LicenseFilters;
    loading: boolean;
  };
  devices: {
    data: TableData<Device>;
    filters: DeviceFilters;
    loading: boolean;
  };
  users: {
    data: TableData<User>;
    filters: UserFilters;
    loading: boolean;
  };
  telemetry: {
    events: TableData<TelemetryEvent>;
    filters: TelemetryFilters;
    loading: boolean;
  };
  ui: {
    sidebarOpen: boolean;
    activeDrawer: string | null;
    confirmDialog: ConfirmDialogState | null;
  };
}
```

### RTK Query API Slices

```typescript
// Admin API slice
export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/admin",
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Dashboard", "License", "Device", "User", "Telemetry", "Audit"],
  endpoints: (builder) => ({
    getDashboardMetrics: builder.query<
      DashboardMetricsResponse,
      { from: string; to: string }
    >({
      query: ({ from, to }) => `metrics/overview?from=${from}&to=${to}`,
      providesTags: ["Dashboard"],
    }),
    getLicenses: builder.query<TableResponse<License>, TableRequest>({
      query: (params) => ({
        url: "licenses",
        params,
      }),
      providesTags: ["License"],
    }),
    // ... other endpoints
  }),
});
```

### Route Protection

```typescript
// Admin route wrapper
function withAdminAuth<T extends {}>(Component: React.ComponentType<T>) {
  return function AdminProtectedComponent(props: T) {
    const { data: user, isLoading } = useGetCurrentUserQuery();

    if (isLoading) {
      return <AdminLoadingSkeleton />;
    }

    if (!user || user.role !== "admin") {
      redirect("/login");
    }

    return <Component {...props} />;
  };
}
```

## Performance Optimizations

### Database Optimizations

- **Compound Indexes**: Create compound indexes for common filter combinations
- **Aggregation Optimization**: Use `$match` early in pipelines to reduce document processing
- **Connection Pooling**: Configure MongoDB connection pool for concurrent requests
- **Query Caching**: Implement Redis caching for frequently accessed aggregations

### Frontend Optimizations

- **Code Splitting**: Lazy load admin routes and components
- **Virtual Scrolling**: Use virtual scrolling for large data tables
- **Memoization**: Memoize expensive calculations and component renders
- **Bundle Optimization**: Separate admin bundle from customer-facing code

### Caching Strategy

```typescript
// Cache configuration
const cacheConfig = {
  dashboard: { ttl: 300 }, // 5 minutes
  licenses: { ttl: 60 }, // 1 minute
  devices: { ttl: 60 }, // 1 minute
  users: { ttl: 300 }, // 5 minutes
  telemetry: { ttl: 30 }, // 30 seconds
  reports: { ttl: 600 }, // 10 minutes
};
```

## Deployment Considerations

### Environment Variables

```bash
# Admin-specific environment variables
ADMIN_RATE_LIMIT_ENABLED=true
ADMIN_AUDIT_RETENTION_DAYS=365
ADMIN_EXPORT_MAX_ROWS=10000
ADMIN_SESSION_TIMEOUT=3600
```

### Monitoring & Alerting

- **Performance Monitoring**: Track API response times and database query performance
- **Error Tracking**: Monitor and alert on admin API errors
- **Security Monitoring**: Track failed authentication attempts and suspicious activities
- **Usage Analytics**: Monitor admin feature usage and performance bottlenecks

### Backup & Recovery

- **Database Backups**: Regular automated backups of MongoDB collections
- **Audit Log Archival**: Archive old audit logs to cold storage
- **Configuration Backup**: Version control for admin configuration settings
- **Disaster Recovery**: Documented procedures for admin system recovery

This design provides a comprehensive foundation for implementing the MyCleanOne Admin Panel while maintaining security, performance, and scalability requirements.
