# Requirements Document

## Introduction

The MyCleanOne Admin Panel is a production-ready administrative system for managing the MyCleanOne licensing business operations. This system provides a single admin role with full access to manage users, licenses, devices, telemetry data, and generate business reports. The admin panel operates independently from customer-facing flows and provides comprehensive dashboards, CRUD operations, and business intelligence capabilities similar to enterprise back-office systems.

## Requirements

### Requirement 1

**User Story:** As an Admin, I want to authenticate and access all administrative functions, so that I can manage the entire MyCleanOne business operations with full privileges.

#### Acceptance Criteria

1. WHEN an Admin logs in THEN the system SHALL authenticate using existing token-based authentication with admin role claims
2. WHEN authentication is successful THEN the system SHALL provide access to all admin routes under /app/admin/\*
3. WHEN accessing any admin functionality THEN the system SHALL verify admin role authorization
4. IF the user lacks admin role THEN the system SHALL deny access and return appropriate error messages
5. WHEN authenticated as admin THEN the system SHALL provide full access to all features including settings, financial data, and user management

### Requirement 2

**User Story:** As an Admin, I want to view a comprehensive dashboard with key business metrics, so that I can monitor the health and performance of the MyCleanOne business.

#### Acceptance Criteria

1. WHEN accessing the dashboard THEN the system SHALL display total users, new users in selected range, active/inactive licenses, and subscription plan ratios
2. WHEN selecting time ranges (7/30/90 days) THEN the system SHALL update all metrics and charts accordingly
3. WHEN viewing charts THEN the system SHALL display daily active devices, daily scan counts, and subscription vs one-time purchase ratios
4. WHEN hovering over chart elements THEN the system SHALL show detailed tooltips with specific values
5. WHEN clicking on metrics THEN the system SHALL navigate to filtered detail views

### Requirement 3

**User Story:** As an Admin, I want to manage licenses with comprehensive filtering and actions, so that I can efficiently handle license-related operations and support requests.

#### Acceptance Criteria

1. WHEN accessing licenses view THEN the system SHALL display paginated table with License Key, User email, Status, Plan, Mode, Purchase Date, Expiry Date, Bound Device, and Stripe Sub ID
2. WHEN applying filters THEN the system SHALL support filtering by subscription plan, date range, status, and license key search
3. WHEN performing license actions THEN the system SHALL allow deactivate/reactivate operations with confirmation dialogs
4. WHEN viewing license details THEN the system SHALL show activity timeline, telemetry data, and associated devices
5. WHEN exporting data THEN the system SHALL generate CSV files with filtered results

### Requirement 4

**User Story:** As an Admin, I want to manage devices with filtering and control actions, so that I can help users with device-related issues and maintain system integrity.

#### Acceptance Criteria

1. WHEN accessing devices view THEN the system SHALL display Device Name, Device GUID, OS, Bound License, User, Status, and Last Activity
2. WHEN filtering devices THEN the system SHALL support filtering by status, Device GUID/Name search, and OS type
3. WHEN performing device actions THEN the system SHALL allow rename, deactivate, and unbind operations
4. WHEN viewing device details THEN the system SHALL show telemetry events and activity history
5. WHEN deactivating devices THEN the system SHALL require confirmation and update device status appropriately

### Requirement 5

**User Story:** As an Admin, I want to search and view user information with full management capabilities, so that I can manage user accounts and provide customer support.

#### Acceptance Criteria

1. WHEN accessing users view THEN the system SHALL display Email, Name, Role, License count, Last Seen, and Stripe Customer ID
2. WHEN searching users THEN the system SHALL support search by email and name with real-time filtering
3. WHEN managing user roles THEN the system SHALL allow changing user roles with confirmation dialogs
4. WHEN viewing user details THEN the system SHALL show associated licenses and devices
5. WHEN performing user actions THEN the system SHALL allow password reset and account management operations

### Requirement 6

**User Story:** As an Admin, I want to explore telemetry data with flexible querying, so that I can analyze user behavior and troubleshoot issues.

#### Acceptance Criteria

1. WHEN accessing telemetry explorer THEN the system SHALL support querying by deviceGuid, licenseKey, user email, date range, and eventType
2. WHEN viewing telemetry results THEN the system SHALL display occurredAt, eventType, appVersion, OS, metadata, and idempotencyKey
3. WHEN examining metadata THEN the system SHALL provide JSON viewer for complex data structures
4. WHEN analyzing trends THEN the system SHALL show volume charts over time for selected filters
5. WHEN exporting telemetry data THEN the system SHALL include all available data without PII masking restrictions

### Requirement 7

**User Story:** As an Admin, I want to generate comprehensive business reports, so that I can analyze business performance and make data-driven decisions.

#### Acceptance Criteria

1. WHEN accessing reports THEN the system SHALL provide Plan Mix analysis with stacked bar charts by month
2. WHEN viewing active device reports THEN the system SHALL show DAU/WAU/MAU metrics with trend analysis
3. WHEN generating exports THEN the system SHALL create CSV files for each report's underlying dataset
4. WHEN selecting time ranges THEN the system SHALL update all report data accordingly
5. WHEN accessing financial reports THEN the system SHALL include complete revenue data from Stripe integration

### Requirement 8

**User Story:** As an Admin, I want to manage system settings and configurations, so that I can control admin user roles, API limits, and monitor system health.

#### Acceptance Criteria

1. WHEN accessing settings THEN the system SHALL provide full access to all configuration options
2. WHEN managing admin roles THEN the system SHALL allow creating, updating, and removing admin user roles
3. WHEN configuring API limits THEN the system SHALL allow setting rate limits for public endpoints
4. WHEN monitoring system health THEN the system SHALL display webhook status, last Stripe events, and telemetry heartbeat
5. WHEN making settings changes THEN the system SHALL log all modifications in AdminAudit collection

### Requirement 9

**User Story:** As an Admin, I want all data tables to support server-side operations, so that I can efficiently work with large datasets without performance issues.

#### Acceptance Criteria

1. WHEN loading any data table THEN the system SHALL implement server-side pagination with default pageSize of 25
2. WHEN sorting columns THEN the system SHALL perform server-side sorting and update URL parameters
3. WHEN applying filters THEN the system SHALL maintain filter state in URL query parameters
4. WHEN navigating between pages THEN the system SHALL preserve all applied filters and sorting
5. WHEN refreshing the page THEN the system SHALL restore previous table state from URL parameters

### Requirement 10

**User Story:** As an Admin, I want comprehensive audit logging of all administrative actions, so that I can maintain security compliance and track system changes.

#### Acceptance Criteria

1. WHEN any admin performs a mutation operation THEN the system SHALL create an AdminAudit record with actorUserId, action, entityType, entityId, payload, and createdAt
2. WHEN viewing audit logs THEN the system SHALL provide searchable and filterable audit trail
3. WHEN destructive actions are performed THEN the system SHALL require typed confirmation before execution
4. WHEN audit records are created THEN the system SHALL ensure immutability and proper indexing
5. WHEN accessing audit data THEN the system SHALL provide full access to all audit information without restrictions
