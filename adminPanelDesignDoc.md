# MyCleanOne Admin Panel – Detailed Design & Technical Specification

> Target: A production‑ready admin system for operating the MyCleanOne licensing business (similar to CCleaner back‑office). This spec is intended for direct use in Cursor to scaffold and implement both frontend and backend.

---

## 0) Scope & Non‑Goals

**In scope**: admin authentication/authorization, dashboards & reporting, CRUD views (Users, Licenses, Devices), telemetry insights (daily scans / active users), Stripe plan mix (subscription vs one‑time), filtering, search, pagination, export, audits.

**Out of scope (phase‑1)**: refund automation, chargeback workflows, in‑app content/campaign manager, complex RBAC beyond 3 roles, support ticketing.

---

## 1) Personas & RBAC

- **Super Admin**: full access including settings.
- **Ops/Support**: read‑only + device/license actions (activate/deactivate/rename); no settings.
- **Finance**: read‑only to subscription/one‑time mix, revenue numbers (from Stripe), export reports; cannot mutate user data.

**RBAC model**: `User.role ∈ {"super_admin","support","finance"}`. API gates by role and route‑level scopes.

---

## 2) Information Architecture (Navigation)

- **Dashboard**
- **Licenses**
- **Devices**
- **Users** (read/search, minimal edits)
- **Telemetry** (explorer)
- **Reports** (plan mix, trend exports)
- **Settings** (roles, API keys, rate limits) – super admin only

Global: top search (by user email, license key, device GUID), profile menu, dark mode.

---

## 3) Frontend (Next.js + React)

### 3.1 Tech & Libraries

- Next.js App Router + TypeScript
- UI: Tailwind v4 + shadcn/ui (Cards, Tabs, Dropdown, Dialog, Badge, Tooltip), AG Grid for data tables (server‑side mode), Recharts for charts
- State: Redux Toolkit + RTK Query for admin APIs
- Auth: access token (Bearer) + refresh cookie; role injected via `/api/auth/*`
- Forms: React Hook Form + Zod
- Intl/date: dayjs (UTC handling)

### 3.2 Route Layout

```
/app/admin
  /dashboard
  /licenses
  /licenses/[licenseId]
  /devices
  /devices/[deviceGuid]
  /users
  /users/[userId]
  /telemetry
  /reports
  /settings
```

### 3.3 Components

- **KPICard** (title, value, delta, tooltip)
- **TrendChart** (area/line, time range picker)
- **DonutChart** (ratios)
- **DataTable** (AG Grid wrapper: server sort/filter/pagination, selection, CSV export)
- **EntityDrawer** (right sheet for quick view/edit)
- **ConfirmDialog** (destructive actions)

### 3.4 Screens & Features

#### A) Dashboard

Cards & charts (selectable range: 7/30/90 days):

1. **No. of Users** (total, new in range)
2. **No. of Licenses** (Active, Inactive)
3. **Subscription plans ratio/trend** (Monthly/Quarterly/Yearly + One‑time vs Subscription donut)
4. **One‑time vs Subscriptions ratio** (donut)
5. **Active Users & Daily Scans** (line chart: daily active devices vs daily scan events)

Interactions: hover details, click through to filtered lists.

#### B) Licenses

- Table columns: License Key, User (email), Status, Plan, Mode (subscription|one‑time), Purchase Date, Expiry Date, Bound Device, Stripe Sub ID
- Filters: **subscription‑wise (plan)**, **date range**, **status**, **by licenseId / key**
- Actions: Deactivate/Reactivate, Extend (link to billing portal), Copy key, View timeline
- Row detail: activity, telemetry last seen, associated devices

#### C) Devices

- Columns: Device Name, Device GUID, OS, Bound License, User, Status (active/inactive), Last Activity
- Filters: **status**, **by Device GUID/Name**, OS
- Actions: Rename, Deactivate, Unbind (if allowed), View events

#### D) Users

- Columns: Email, Name, Role (for admins), #Licenses, Last Seen, Stripe Customer ID
- Search: email/name
- Actions (super admin): change role (with confirmation), reset password link, view licenses/devices

#### E) Telemetry Explorer

- Query by: deviceGuid, licenseKey, user email, date range, eventType
- Table: occurredAt, eventType, appVersion, os, metadata (JSON viewer), idempotencyKey
- Chart: volume over time for selected filter

#### F) Reports

- **Plan Mix** (stacked bar by month: monthly/quarterly/yearly + one‑time)
- **Active Devices** (DAU/WAU/MAU)
- **Retention** (cohort, phase‑2)
- Export: CSV for each chart’s underlying dataset

#### G) Settings (super admin)

- Manage roles for internal admin users
- API rate‑limit configs for public endpoints
- Webhook health status (last Stripe webhook event, last telemetry ingest heartbeat)

### 3.5 UX Details

- Skeleton loaders, empty‑states, optimistic toasts for non‑destructive changes, destructive actions require typed confirmation
- All tables default to server pagination `pageSize=25` with remember‑my‑filters (URL query params)

---

## 4) Backend (Next.js API + MongoDB + Stripe + SQS)

### 4.1 Data Model Additions

```ts
// User
role?: "super_admin" | "support" | "finance" // default none for customers
lastSeenAt?: Date // update from telemetry or app login

// License (augment)
mode?: "subscription" | "payment" // one‑time = payment
plan?: "monthly" | "quarterly" | "yearly"
indices: [ { licenseKey: 1, unique: true }, { status: 1 }, { plan: 1 }, { mode: 1 }, { userId: 1 }, { purchaseDate: -1 }, { expiryDate: -1 } ]

// Device (augment)
status?: "active" | "inactive"
indices: [ { deviceGuid: 1, unique: true, sparse: true }, { userId: 1 }, { licenseId: 1 }, { lastActivity: -1 } ]

// TelemetryEvent (ensure)
indices: [ { deviceGuid: 1, occurredAt: -1 }, { licenseId: 1, occurredAt: -1 }, { eventType: 1, occurredAt: -1 }, { idempotencyKey: 1, unique: true, sparse: true } ]
```

### 4.2 AuthN/Z

- Reuse existing token model. Add **role claim** to access token.
- Middleware: `requireAdmin(role?: Role[])` – rejects if missing/insufficient.
- Admin routes are isolated under `/api/admin/*` and never exposed to customers via UI.

### 4.3 Admin API Endpoints

All endpoints accept server‑side table params: `page`, `pageSize`, `sortBy`, `sortDir`, `filters`.

**Dashboard**

- `GET /api/admin/metrics/overview?from&to`

  - returns: usersTotal, usersNew, licensesActive, licensesInactive, planRatio, modeRatio, dailyActiveDevices\[], dailyScanCounts\[]

**Licenses**

- `GET /api/admin/licenses` – server‑side table with filters (status, plan, mode, date range, licenseKey search)
- `GET /api/admin/licenses/:id` – license detail
- `POST /api/admin/licenses/:id/deactivate`
- `POST /api/admin/licenses/:id/reactivate`

**Devices**

- `GET /api/admin/devices` – filters: status, os, deviceGuid/name, userEmail
- `POST /api/admin/devices/:id/rename`
- `POST /api/admin/devices/:id/deactivate`

**Users**

- `GET /api/admin/users` – search by email/name
- `GET /api/admin/users/:id`
- `POST /api/admin/users/:id/role` – body: { role }

**Telemetry**

- `GET /api/admin/telemetry/events` – paged, filterable
- `GET /api/admin/telemetry/summary?from&to&eventType`

**Reports**

- `GET /api/admin/reports/plan-mix?from&to&bucket=month`
- `GET /api/admin/reports/active-devices?from&to&bucket=day|week|month`
- `GET /api/admin/reports/export.csv?report=plan-mix&…` (stream CSV)

### 4.4 Aggregation Specs (MongoDB)

**A) Counts & Ratios**

- Licenses Active/Inactive: `$match` by status → `$group`
- Plan ratio: `$group` by `plan`
- Mode ratio: `$group` by `mode`

**B) One‑time vs Subscriptions**

```
$match: { purchaseDate: { $gte: from, $lte: to } }
$group: { _id: "$mode", count: { $sum: 1 } }
```

**C) Daily Active Devices (DAD)**

```
$match: { occurredAt: { $gte: from, $lte: to } }
$group: { _id: { day: { $dateTrunc: { date: "$occurredAt", unit: "day" } }, device: "$deviceGuid" } }
$group: { _id: "$_id.day", activeDevices: { $sum: 1 } }
$sort: { _id: 1 }
```

**D) Daily Scan Counts** (assuming `eventType: "scan_run"`)

```
$match: { occurredAt: { $gte: from, $lte: to }, eventType: "scan_run" }
$group: { _id: { day: { $dateTrunc: { date: "$occurredAt", unit: "day" } } }, scans: { $sum: 1 } }
$sort: { _id: 1 }
```

**E) Plan Mix by Month**

```
$match: { purchaseDate: { $gte: from, $lte: to } }
$group: { _id: { m: { $dateTrunc: { date: "$purchaseDate", unit: "month" } }, plan: "$plan", mode: "$mode" }, c: { $sum: 1 } }
$group: { _id: "$_id.m", buckets: { $push: { plan: "$_id.plan", mode: "$_id.mode", c: "$c" } } }
$sort: { _id: 1 }
```

### 4.5 Server‑Side Table Pattern

- Query DTO: `{ page=1, pageSize=25, sortBy, sortDir, filters: {...} }`
- Return: `{ rows: [], page, pageSize, total }`
- Implement indexes for each filterable field; ensure `$regex` searches use case‑insensitive anchored patterns (and sparingly).

### 4.6 Webhook & Status Sync

- Stripe webhooks already update license activation/expiry. Ensure admin UI reflects live status (invalidate caches on webhook via lightweight pub/sub or tag‑based revalidation).

### 4.7 Auditing & Logging

- Create `AdminAudit` collection: `{ actorUserId, action, entityType, entityId, payload, createdAt }`
- Wrap all POST/PUT/DELETE admin routes to emit audit log entries.

### 4.8 Rate Limiting & Security

- Apply stricter rate limits to `/api/admin/*` by IP & user.
- All admin routes require HTTPS and CSRF tokens not necessary for pure API with Bearer, but enforce `SameSite=Strict` on refresh cookie.
- Do not leak PII in telemetry views; mask email in export unless role=super_admin.

### 4.9 Error Model

Standard error envelope:

```json
{ "success": false, "message": "...", "code": "VALIDATION_ERROR", "details": { ... } }
```

### 4.10 Testing Strategy

- Unit tests: aggregation builders, RBAC middleware
- Integration tests: licenses/devices list endpoints, dashboard metrics with seeded data
- E2E (Playwright): smoke for login, dashboard loads, filters persist, actions work

---

## 5) API Contracts (DTOs)

### 5.1 Dashboard Overview (response)

```ts
{
  users: { total: number, newInRange: number },
  licenses: { active: number, inactive: number },
  plans: { monthly: number, quarterly: number, yearly: number },
  modes: { subscription: number, payment: number },
  timeseries: {
    dailyActiveDevices: Array<{ date: string, count: number }>,
    dailyScans: Array<{ date: string, count: number }>
  }
}
```

### 5.2 List Endpoints (request)

```ts
// /api/admin/licenses
{
  page?: number,
  pageSize?: number,
  sortBy?: "purchaseDate"|"expiryDate"|"status"|"plan",
  sortDir?: "asc"|"desc",
  filters?: {
    status?: "active"|"inactive",
    plan?: "monthly"|"quarterly"|"yearly",
    mode?: "subscription"|"payment",
    from?: string, to?: string,
    licenseKey?: string
  }
}
```

### 5.3 Mutations

- `POST /api/admin/licenses/:id/deactivate` → `{ success: true }`
- `POST /api/admin/licenses/:id/reactivate` → `{ success: true }`
- `POST /api/admin/devices/:id/rename` → `{ name: string }`
- `POST /api/admin/users/:id/role`
