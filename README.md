## Project: MyCleanOne Licensing Web App

Modern web application to buy and manage licenses for the MyCleanOne cleaner app. Includes authentication, license/device management, Stripe subscriptions and one‑time payments, email notifications via SQS, and telemetry ingestion from the desktop client.

## Tech Stack

- Next.js App Router (React 19) with TypeScript
- API routes co‑located under `src/app/api/*`
- MongoDB + Mongoose
- Stripe Checkout + Webhooks
- AWS SQS for transactional emails
- Tailwind CSS (v4) + Framer Motion for UI

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Configure environment variables (see list below)

3. Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

- Database
  - `MONGODB_URI`
- JWT
  - `JWT_SECRET`
  - `JWT_REFRESH_SECRET`
- Stripe
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - Recurring prices: `STRIPE_MONTHLY_PRICE_ID`, `STRIPE_QUARTERLY_PRICE_ID`, `STRIPE_YEARLY_PRICE_ID`
  - One‑time prices: `STRIPE_MONTHLY_ONETIME_PRICE_ID`, `STRIPE_QUARTERLY_ONETIME_PRICE_ID`, `STRIPE_YEARLY_ONETIME_PRICE_ID`
- Email (AWS SQS)
  - `AWS_REGION`
  - `AWS_SQS_QUEUE_URL`
- App URLs
  - `NEXT_PUBLIC_BASE_URL` (e.g. `http://localhost:3000`)

## Repository Layout

- `src/app` – pages and API routes
  - `api/auth/*` – login/register/password flows
  - `api/licenses/*` – license CRUD, activation
  - `api/devices/*` – device listing, rename/deactivate
  - `api/stripe/*` – checkout, webhook, billing portal
  - `api/telemetry/events` – telemetry POST/GET
  - UI routes under `dashboard/*`, `marketing/*`, etc.
- `src/models` – Mongoose schemas (`User`, `License`, `Device`, `TelemetryEvent`)
- `src/lib` – DB, Stripe, Axios client, utilities, services
- `src/store` – Redux store (minimal auth slice)
- `src/middleware.ts` – API protection and page redirects

## Authentication Overview

- Access Token (short‑lived, 15m) returned on `POST /api/auth/login` and stored in `localStorage` for API calls
- Refresh Token (7d) is an httpOnly cookie set by login
- API protection via middleware validates `Authorization: Bearer <accessToken>` and injects `x-user-id`/`x-user-email`
- Page redirects use the presence of the refresh token cookie

### Auth Endpoints

- `POST /api/auth/register` – send password setup link (email via SQS)
- `POST /api/auth/create-password` – set initial password
- `POST /api/auth/login` – returns access token + sets refresh cookie
- `POST /api/auth/refresh-token` – returns new access token using refresh cookie
- `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- `POST /api/auth/logout` – clears refresh cookie

## Payments & Plans

- Three plans by tenure: monthly, quarterly, yearly
- Two purchase modes:
  - Subscriptions: recurring Stripe prices
  - One‑time: single charge with one‑time prices (also used for renewals)

### Checkout Session

`POST /api/stripe/create-checkout-session`

- Body: `{ plan, quantity, mode, licenseId? }`
- mode:
  - `subscription` → uses recurring price IDs
  - `payment` → uses one‑time price IDs
- The route validates price types and collects billing address/phone to satisfy export rules.

### Webhook

`POST /api/stripe/webhook`

- `checkout.session.completed`:
  - subscription → create N licenses
  - one‑time with `licenseId` → renew that license
  - one‑time without `licenseId` → first‑time license purchase
- `invoice.paid` → reactivate and extend expiry
- `invoice.payment_failed`/`customer.subscription.deleted` → deactivate
- `customer.subscription.updated` → resize license count

## License & Device Management

### Pages

- `dashboard/licenses` – list, copy keys, buy or renew (subscription or pay‑now)
- `dashboard/devices` – list with license keys, rename/deactivate

### API

- `GET /api/licenses` – list licenses for current user
- `POST /api/licenses/[id]/activate` – bind a device to a license (auth)
- `POST /api/licenses/activate-client` – public activation for the desktop app using `{ licenseKey, deviceGuid, name, os }` with hard binding (prevents override)
- `GET /api/devices` – list user devices with license details
- `POST /api/devices/[id]/rename`, `POST /api/devices/[id]/deactivate`

## Telemetry (Desktop Client)

- Public, licenseKey + deviceGuid auth (no JWT)
- `POST /api/telemetry/events` – ingest batched events (idempotent)
- `GET /api/telemetry/events` – fetch recent events for a device

### Example cURL

```bash
curl -X POST "$BASE_URL/api/telemetry/events" \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "LICENSE_KEY",
    "deviceGuid": "DEVICE_GUID",
    "sessionId": "a4f3e7e2-0a6b-4e7f-9f1b-bc5b2b917b9f",
    "appVersion": "2.1.0",
    "os": "Windows",
    "events": [
      { "idempotencyKey": "evt-1001", "eventType": "app_open" },
      { "idempotencyKey": "evt-1002", "eventType": "menu_click", "metadata": { "menu": "system_scan" } }
    ]
  }'
```

## Schemas

### `User`

```ts
email: string
password?: string (hashed)
license?: ObjectId
name?: string
phone?: string
address?: { line1?, line2?, city?, state?, postal_code?, country? }
stripeCustomerId?: string
```

### `License`

```ts
licenseKey: string (unique)
userId: ObjectId
deviceId?: string (device GUID binding)
status: "active" | "inactive"
purchaseDate: Date
stripeSubscriptionId?: string
stripeCustomerId?: string
expiryDate?: Date
plan?: string // monthly|quarterly|yearly
```

### `Device`

```ts
name: string
os: string
deviceGuid?: string (unique, sparse)
licenseId: ObjectId (ref License)
userId: ObjectId (ref User)
lastActivity: Date
```

### `TelemetryEvent`

```ts
userId: ObjectId
licenseId: ObjectId
deviceGuid: string
sessionId?: string
eventType: string
occurredAt: Date
appVersion?: string
os?: string
metadata?: Record<string, any>
idempotencyKey?: string (unique, optional)
```

## Middleware

- Public API allow‑list in `src/middleware.ts`:
  - Auth routes, Stripe webhook, `licenses/activate-client`, `telemetry/events`, `user/profile`
- All other `/api/*` require a valid access token; middleware injects `x-user-id`/`x-user-email` for handlers.
- Pages: refresh token cookie controls redirects between `/login` and `/dashboard`.

## Email & SQS

- `src/lib/sqsService.ts` pushes email jobs to AWS SQS
- Templates assembled via `src/lib/licenseEmailService.ts`
- Used in registration (password setup), welcome, and license lifecycle emails

## Development

- Scripts
  - `npm run dev` – start dev server
  - `npm run build` – build
  - `npm run start` – start production server
  - `npm run lint` – lint

- Minimum versions
  - Node 18+
  - Next 15+

## Security Notes

- Access tokens are short‑lived; refresh token is httpOnly cookie
- Public endpoints are rate‑limit candidates in production (add middleware/proxy‑level limits)
- Avoid sending PII in telemetry; client computes reminders locally

## Troubleshooting

- Checkout errors about price type → verify env price IDs match mode
- India export banner → we require billing address/phone and use `customer_creation: "always"`
- Model fields not persisting in dev → HMR schema patch in `src/models/User.ts`

## Contributing

PRs welcome. Please open issues for bugs or feature requests.
