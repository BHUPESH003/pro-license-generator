# Implementation Plan

- [x] 1. Set up admin authentication and middleware infrastructure

  - Create admin role field in User model and update authentication middleware to support admin role verification
  - Implement requireAdmin middleware function for protecting admin routes
  - Add admin role to JWT token claims and update token verification logic
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Create enhanced data models with admin-specific fields

  - Update User model to include role and lastSeenAt fields with proper validation
  - Enhance License model with mode and planType fields for admin analytics
  - Add status field to Device model for admin device management
  - Create AdminAudit model for comprehensive action logging
  - _Requirements: 10.1, 10.4_

- [x] 3. Implement database indexes for admin query optimization

  - Add compound indexes to License collection for efficient filtering and sorting
  - Create indexes on Device collection for admin search and filtering operations
  - Implement indexes on TelemetryEvent collection for admin analytics queries
  - Add indexes to AdminAudit collection for audit trail searches
  - _Requirements: 9.1, 9.2, 9.4_

- [x] 4. Build core admin UI components library

  - Create KPICard component for displaying dashboard metrics with delta indicators
  - Implement TrendChart component using Recharts for time-series data visualization
  - Build DonutChart component for ratio and distribution displays
  - Develop ConfirmDialog component for destructive action confirmations
  - Create EntityDrawer component for quick view and edit operations
  - _Requirements: 2.4, 3.3, 4.4, 5.4, 6.3_

- [x] 5. Implement DataTable component with server-side operations

  - Create reusable DataTable component using AG Grid with server-side mode
  - Implement server-side pagination, sorting, and filtering capabilities
  - Add URL query parameter persistence for table state management
  - Build CSV export functionality for data tables
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 6. Create admin layout and navigation structure

  - Build admin layout component with sidebar navigation and header
  - Implement responsive design for mobile and desktop admin interface
  - Create admin route protection wrapper with role verification
  - Add admin-specific styling and theme integration
  - _Requirements: 1.2, 1.3_

- [x] 7. Implement dashboard metrics API endpoints

  - Create /api/admin/metrics/overview endpoint with MongoDB aggregations
  - Build aggregation pipelines for user counts, license statistics, and plan ratios
  - Implement daily active devices and scan count time-series aggregations
  - Add caching layer for dashboard metrics to improve performance
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 8. Build dashboard page with comprehensive metrics display

  - Create dashboard page layout with KPI cards and charts
  - Implement time range selector (7/30/90 days) with metric updates
  - Add interactive charts with hover tooltips and click-through navigation
  - Integrate real-time data updates and loading states
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 9. Implement license management API endpoints

  - Create /api/admin/licenses endpoint with server-side table operations
  - Build license detail endpoint with activity timeline and device associations
  - Implement license action endpoints (deactivate/reactivate) with audit logging
  - Add comprehensive filtering by status, plan, mode, date range, and license key
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 10. Build license management interface
  - Create licenses list page with DataTable integration and filtering
  - Implement license detail drawer with activity timeline and device information
  - Add license action buttons (deactivate/reactivate) with confirmation dialogs
  - Build license search and export functionality
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
- [x] 11. Implement device management API endpoints

  - Create /api/admin/devices endpoint with filtering by status, OS, and device GUID
  - Build device detail endpoint with telemetry events and activity history
  - Implement device action endpoints (rename, deactivate, unbind) with audit logging
  - Add device search functionality by GUID, name, and associated user email
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 12. Build device management interface

  - Create devices list page with comprehensive filtering and search capabilities
  - Implement device detail drawer with telemetry events and activity timeline
  - Add device action buttons (rename, deactivate, unbind) with confirmation workflows
  - Build device export functionality and real-time status updates
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 13. Implement user management API endpoints

  - Create /api/admin/users endpoint with search by email and name
  - Build user detail endpoint with associated licenses and devices
  - Implement user role management endpoint with confirmation requirements
  - Add user action endpoints (password reset, account management) with audit logging
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 14. Build user management interface

  - Create users list page with search functionality and user information display
  - Implement user detail drawer with licenses and devices associations
  - Add user role management interface with confirmation dialogs
  - Build user action buttons (password reset, account management) with proper workflows
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 15. Implement telemetry explorer API endpoints

  - Create /api/admin/telemetry/events endpoint with flexible querying capabilities
  - Build telemetry filtering by deviceGuid, licenseKey, user email, date range, and eventType
  - Implement telemetry summary endpoint for trend analysis and volume charts
  - Add telemetry export functionality with full data access
  - _Requirements: 6.1, 6.2, 6.4, 6.5_

- [x] 16. Build telemetry explorer interface

  - Create telemetry explorer page with advanced filtering and search capabilities
  - Implement telemetry results table with JSON metadata viewer
  - Add telemetry trend charts showing volume over time for selected filters
  - Build telemetry export functionality with comprehensive data access
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 17. Implement business reports API endpoints

  - Create /api/admin/reports/plan-mix endpoint with stacked bar chart data
  - Build /api/admin/reports/active-devices endpoint for DAU/WAU/MAU metrics
  - Implement report export endpoints for CSV generation of underlying datasets
  - Add financial report integration with complete Stripe revenue data
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 18. Build business reports interface

  - Create reports page with Plan Mix analysis and stacked bar charts
  - Implement active device reports with DAU/WAU/MAU trend analysis
  - Add time range selectors that update all report data accordingly
  - Build comprehensive CSV export functionality for all report types
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 19. Implement system settings API endpoints

  - Create /api/admin/settings endpoints for configuration management
  - Build admin role management endpoints for creating and updating admin users
  - Implement API rate limit configuration endpoints
  - Add system health monitoring endpoints for webhook status and telemetry heartbeat
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 20. Build system settings interface

  - Create settings page with full access to all configuration options
  - Implement admin role management interface for user role administration
  - Add API rate limit configuration interface with validation
  - Build system health monitoring dashboard with webhook and telemetry status
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 21. Implement comprehensive audit logging system

  - Create audit logging middleware that captures all admin mutation operations
  - Build AdminAudit record creation with actorUserId, action, entityType, entityId, and payload
  - Implement audit trail viewing interface with search and filtering capabilities
  - Add audit log retention and archival functionality
  - _Requirements: 10.1, 10.2, 10.4, 10.5_

- [x] 22. Add Redux store and RTK Query integration

  - Set up Redux store with admin-specific slices for dashboard, licenses, devices, users, and telemetry
  - Implement RTK Query API slices for all admin endpoints with proper caching
  - Add optimistic updates for non-destructive operations and proper error handling
  - Create admin state management with UI state for drawers, dialogs, and navigation
  - _Requirements: 2.2, 3.2, 4.2, 5.2, 6.2, 7.2_

- [x] 23. Implement error handling and loading states

  - Create standardized error handling across all admin API endpoints
  - Implement skeleton loaders for all admin pages and components
  - Add empty state components for tables and charts when no data is available
  - Build toast notification system for operation feedback and error messages
  - _Requirements: 1.4, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1_

- [ ] 24. Add comprehensive testing suite

  - Write unit tests for all MongoDB aggregation builders and utility functions
  - Create integration tests for admin API endpoints with seeded test data
  - Implement E2E tests using Playwright for admin login, dashboard, and CRUD operations
  - Add performance tests for large dataset operations and export functionality
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 25. Implement security hardening and rate limiting
  - Add rate limiting middleware specifically for admin API endpoints
  - Implement CSRF protection for all state-changing admin operations
  - Add input validation and sanitization for all admin API inputs
  - Create security monitoring and alerting for suspicious admin activities
  - _Requirements: 1.3, 1.4, 10.3, 10.5_
