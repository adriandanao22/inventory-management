# Inventory Management

A full-stack inventory management application built with Next.js, Supabase, and TypeScript. Track products, manage stock adjustments, monitor low-stock alerts via email, and view dashboard analytics — all behind secure JWT authentication.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Installation](#installation)
- [Scripts](#scripts)
- [API Reference](#api-reference)
  - [Response Format](#response-format)
  - [Authentication](#authentication)
  - [Auth Routes](#auth-routes)
  - [User Routes](#user-routes)
  - [Product Routes](#product-routes)
  - [Stock Adjustment Routes](#stock-adjustment-routes)
  - [Dashboard Routes](#dashboard-routes)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Tech Stack

| Layer           | Technology                                      |
| --------------- | ----------------------------------------------- |
| Framework       | Next.js 16 (App Router, Turbopack)              |
| Language        | TypeScript 5                                    |
| Database        | Supabase (PostgreSQL)                           |
| Auth            | JWT (`jsonwebtoken`) + bcrypt, httpOnly cookies |
| Styling         | Tailwind CSS 4, `clsx` + `tailwind-merge`       |
| Charts          | Recharts                                        |
| Email           | Resend                                          |
| Spam Protection | Google reCAPTCHA v2                             |
| Theming         | `next-themes` (system / light / dark)           |
| Testing         | Jest 30, React Testing Library                  |

---

## Features

- **Authentication** — Signup (with reCAPTCHA), login, logout with JWT stored in httpOnly cookies.
- **Product Management** — Full CRUD with filtering by category, status, and search.
- **Stock Adjustments** — Incoming/outgoing adjustments that automatically update product stock and status.
- **Low-Stock Email Alerts** — Configurable per-user threshold; Resend email fires only on threshold transition.
- **Dashboard** — Metrics (total products, stock value, low/out-of-stock counts), recent activity, and top products.
- **Settings** — Update profile, change password, configure low-stock alert threshold.
- **Dark Mode** — System-aware theme toggle.

---

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout (fonts, providers, auth context)
│   ├── page.tsx                # Landing page
│   ├── login/page.tsx          # Login form
│   ├── signup/page.tsx         # Signup form
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard shell (navbar, footer)
│   │   ├── page.tsx            # Dashboard overview (metrics, charts)
│   │   ├── products/
│   │   │   ├── page.tsx        # Product list
│   │   │   ├── new/page.tsx    # Create product
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # Product detail
│   │   │       └── edit/page.tsx
│   │   ├── stock-adjustment/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── login/route.ts
│       ├── signup/route.ts
│       ├── logout/route.ts
│       ├── me/route.ts              # GET/PUT profile
│       ├── me/password/route.ts     # PUT change password
│       ├── me/settings/route.ts     # GET/PUT notification settings
│       ├── products/route.ts        # GET (list) / POST (create)
│       ├── products/[id]/route.ts   # GET / PUT / DELETE
│       ├── stock-adjustments/route.ts
│       ├── dashboard/route.ts
│       └── notes/route.ts
├── src/
│   ├── components/             # Reusable UI (Navbar, Footer, Card, ThemeSwitcher)
│   ├── context/authContext.tsx  # AuthProvider + useAuth() hook
│   ├── lib/
│   │   ├── auth.ts             # signToken / verifyToken
│   │   ├── resend.ts           # sendLowStockEmail
│   │   ├── utils.ts            # cn() helper (clsx + tailwind-merge)
│   │   └── supabase/
│   │       ├── client.ts       # Browser-side Supabase client
│   │       └── server.ts       # Server-side Supabase client (service role)
│   └── types/                  # TypeScript interfaces
│       ├── user.ts
│       ├── products.ts
│       ├── auth.ts
│       ├── stockAdjustments.ts
│       └── index.ts            # Barrel export
└── __tests__/                  # Co-located under app/api/__tests__/ and src/__tests__/
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A [Supabase](https://supabase.com) project
- A [Resend](https://resend.com) account (for email alerts)
- A [Google reCAPTCHA v2](https://www.google.com/recaptcha) site key

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-jwt-secret

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key

# Resend
RESEND_API_KEY=your-resend-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

Run the following SQL in the Supabase SQL Editor to set up the schema:

```sql
-- Users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  username      TEXT UNIQUE NOT NULL,
  password      TEXT NOT NULL,
  low_stock_limit INTEGER NOT NULL DEFAULT 5,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Products
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  sku             TEXT NOT NULL,
  category        TEXT DEFAULT '',
  stock           INTEGER NOT NULL DEFAULT 0,
  price           NUMERIC(10,2) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'In Stock',
  description     TEXT DEFAULT '',
  supplier        TEXT DEFAULT '',
  location        TEXT DEFAULT '',
  min_stock       INTEGER NOT NULL DEFAULT 5,
  last_restocked  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(sku, user_id)
);

-- Stock Adjustments
CREATE TABLE stock_adjustments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('incoming', 'outgoing')),
  units       INTEGER NOT NULL CHECK (units > 0),
  reason      TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Notes (optional)
CREATE TABLE notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  content     TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_products_user    ON products(user_id);
CREATE INDEX idx_products_sku     ON products(sku);
CREATE INDEX idx_adjustments_product ON stock_adjustments(product_id);
CREATE INDEX idx_adjustments_user    ON stock_adjustments(user_id);
```

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd inventory-management

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Scripts

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `npm run dev`        | Start dev server (Turbopack) |
| `npm run build`      | Production build             |
| `npm start`          | Start production server      |
| `npm run lint`       | Run ESLint                   |
| `npm test`           | Run all tests                |
| `npm run test:watch` | Run tests in watch mode      |
| `npm run test:ci`    | Run tests with coverage (CI) |

---

## API Reference

### Response Format

All API responses follow this envelope:

```json
{
  "c": 200,
  "m": "Success",
  "d": {}
}
```

| Field | Type     | Description            |
| ----- | -------- | ---------------------- |
| `c`   | `number` | HTTP status code       |
| `m`   | `string` | Human-readable message |
| `d`   | `any`    | Response data payload  |

### Authentication

Authentication uses JWT tokens stored in `auth-token` httpOnly cookies. Protected routes verify the token via `verifyToken()` and extract the user's `userId`, `email`, and `username` from the payload.

---

### Auth Routes

#### `POST /api/signup`

Register a new user.

| Field             | Type     | Required |
| ----------------- | -------- | -------- |
| `token`           | `string` | Yes      |
| `email`           | `string` | Yes      |
| `username`        | `string` | Yes      |
| `password`        | `string` | Yes      |
| `confirmPassword` | `string` | Yes      |

**Note:** This route uses a flat request body, not wrapped in `{ d: ... }`.

**Responses:** `201` success, `400` captcha/validation error, `500` server error.

---

#### `POST /api/login`

Authenticate a user.

**Body:** `{ d: { username, password } }`

**Responses:** `200` success (sets cookie), `400` missing fields, `401` invalid credentials.

---

#### `POST /api/logout`

Clear the auth cookie. No body required.

**Response:** `200`.

---

### User Routes

#### `GET /api/me`

Returns the authenticated user's JWT payload.

**Response `d`:** `{ user: { userId, email, username } }`

---

#### `PUT /api/me`

Update profile information.

**Body:** `{ d: { username?, email? } }`

**Responses:** `200` success (re-issues cookie), `400` nothing to update, `409` duplicate username/email.

---

#### `PUT /api/me/password`

Change password.

**Body:** `{ d: { currentPassword, newPassword } }`

**Responses:** `200` success, `401` wrong current password, `400` missing fields or new password < 6 chars.

---

#### `GET /api/me/settings`

Get notification settings.

**Response `d`:** `{ low_stock_limit: number }`

---

#### `PUT /api/me/settings`

Update notification settings.

**Body:** `{ d: { low_stock_limit: number } }`

**Responses:** `200` success, `400` invalid value.

---

### Product Routes

#### `GET /api/products`

List all products for the authenticated user.

| Query Param | Type     | Description                   |
| ----------- | -------- | ----------------------------- |
| `category`  | `string` | Filter by category            |
| `status`    | `string` | Filter by status              |
| `search`    | `string` | Search by name or SKU (ilike) |

**Response `d`:** `Product[]`

---

#### `POST /api/products`

Create a new product.

**Body:** `{ d: { name, sku, price, category?, stock?, status?, description?, supplier?, location?, min_stock?, last_restocked? } }`

**Responses:** `201` created, `400` missing required fields, `409` duplicate SKU.

---

#### `GET /api/products/:id`

Get a single product by ID.

**Response `d`:** `Product` or `404`.

---

#### `PUT /api/products/:id`

Update a product.

**Body:** `{ d: UpdateProduct }` (partial fields)

**Responses:** `200` success, `400` empty update, `404` not found, `409` duplicate SKU.

---

#### `DELETE /api/products/:id`

Delete a product.

**Response:** `200` success, `500` error.

---

### Stock Adjustment Routes

#### `GET /api/stock-adjustments`

List stock adjustments with product and user details.

| Query Param  | Type     | Description                  |
| ------------ | -------- | ---------------------------- |
| `type`       | `string` | `"incoming"` or `"outgoing"` |
| `product_id` | `string` | Filter by product            |
| `limit`      | `number` | Max results (default 50)     |

**Response `d`:** `StockAdjustmentWithDetails[]`

---

#### `POST /api/stock-adjustments`

Create a stock adjustment. This will:

1. Update the product's `stock`, `status`, and `last_restocked` (for incoming).
2. Set status to `"Out of Stock"` / `"Low Stock"` / `"In Stock"` based on `min_stock`.
3. Send a low-stock email alert if the stock drops below the user's `low_stock_limit` (transition only).

**Body:** `{ d: { product_id, type, units, reason? } }`

**Responses:** `201` created, `400` insufficient stock, `404` product not found.

---

### Dashboard Routes

#### `GET /api/dashboard`

Aggregated metrics for the authenticated user.

**Response `d`:**

```json
{
  "metrics": {
    "totalProducts": 42,
    "totalStockValue": 15230.5,
    "lowStockCount": 3,
    "outOfStock": 1
  },
  "lowStockItems": [],
  "recentActivity": [],
  "topProducts": []
}
```

---

## Database Schema

```
┌──────────────┐       ┌──────────────────┐       ┌───────────────────┐
│    users     │       │     products     │       │ stock_adjustments │
├──────────────┤       ├──────────────────┤       ├───────────────────┤
│ id (PK)      │◄──┐   │ id (PK)          │◄──┐   │ id (PK)           │
│ email        │   │   │ user_id (FK)─────│───┘   │ product_id (FK)───│───►
│ username     │   │   │ name             │       │ user_id (FK)──────│───►
│ password     │   └───│ sku (unique/user) │       │ type              │
│ low_stock_limit│     │ category         │       │ units             │
│ created_at   │       │ stock            │       │ reason            │
└──────────────┘       │ price            │       │ created_at        │
                       │ status           │       └───────────────────┘
                       │ min_stock        │
                       │ description      │
                       │ supplier         │
                       │ location         │
                       │ last_restocked   │
                       │ created_at       │
                       │ updated_at       │
                       └──────────────────┘
```

- **users → products**: One-to-many (each user owns products).
- **products → stock_adjustments**: One-to-many (each product has adjustments).
- **users → stock_adjustments**: One-to-many (each user creates adjustments).
- SKU is unique per user (`UNIQUE(sku, user_id)`).

---

## Testing

Tests use **Jest 30** with `ts-jest`. API route tests use `/** @jest-environment node */`; component tests use `jsdom`.

```bash
# Run all tests
npm test

# Run with verbose output
npx jest --verbose

# Run a specific test file
npx jest app/api/__tests__/products/route.test.ts

# Run with coverage
npm run test:ci
```

**Test suites:**

| Suite              | Tests | Coverage                                                  |
| ------------------ | ----- | --------------------------------------------------------- |
| Auth Library       | 3     | `signToken`, `verifyToken`                                |
| `POST /api/login`  | 5     | Validation, credentials, success                          |
| `POST /api/signup` | 5     | reCAPTCHA, passwords, duplicates, success                 |
| Products CRUD      | 6     | List, filters, create, duplicate SKU                      |
| Products `[id]`    | 6     | GET, PUT, DELETE, 404, duplicate SKU                      |
| Stock Adjustments  | 8     | Auth, 404, insufficient, status transitions, email alerts |
| Dashboard          | 2     | Metrics aggregation, low-stock items                      |
| User Settings      | 8     | GET/PUT low-stock limit, validation                       |
| ThemeSwitcher      | 1     | Render and toggle                                         |

---

## Deployment

The project is ready for deployment on [Vercel](https://vercel.com):

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add all [environment variables](#environment-variables) in the Vercel dashboard.
4. Deploy.

For other platforms, build and start the production server:

```bash
npm run build
npm start
```
