# WalletWhiz Backend

A finance data processing and access control API built with Node.js, Express, TypeScript, and MongoDB.

## Live

[https://zorvyn-fl9b.vercel.app](https://zorvyn-fl9b.vercel.app)

Health check: `GET /health`

## Features

- JWT access tokens + rotating refresh sessions via httpOnly cookies
- Role-based access control (Admin, Analyst, Viewer)
- Financial record CRUD with soft delete
- Dashboard aggregations — totals, category breakdown, trend data, recent activity
- Future record filtering — queries are always capped to the current timestamp
- Zod request validation and structured error responses
- Deployed as a serverless Express app on Vercel

## Stack

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT + rotating refresh tokens
- Zod validation
- Vercel (serverless)

## Role Model

| Role | Capabilities |
|------|--------------|
| `admin` | Full access — users, records, dashboard |
| `analyst` | Read records and dashboard |
| `viewer` | Dashboard only |

## API

Base path: `/api/v1`

### Auth

| Method | Path | Access |
|--------|------|--------|
| `POST` | `/auth/login` | Public |
| `POST` | `/auth/logout` | Authenticated |
| `POST` | `/auth/refresh` | Public (refresh cookie) |
| `GET` | `/auth/me` | Authenticated |

### Records

| Method | Path | Access |
|--------|------|--------|
| `GET` | `/records` | Admin, Analyst |
| `GET` | `/records/:id` | Admin, Analyst |
| `POST` | `/records` | Admin |
| `PATCH` | `/records/:id` | Admin |
| `DELETE` | `/records/:id` | Admin |

Filters: `page`, `limit`, `type`, `category`, `from`, `to`, `search`, `sortBy`, `sortOrder`

### Dashboard

| Method | Path | Access |
|--------|------|--------|
| `GET` | `/dashboard/overview` | All roles |

Params: `from`, `to`, `recentLimit`, `trend` (`daily`, `weekly`, `monthly`)

Returns totals, category breakdown, trend series, and recent activity — always filtered to records up to the current moment.

### Users (Admin only)

| Method | Path |
|--------|------|
| `GET` | `/users` |
| `POST` | `/users` |
| `GET` | `/users/:id` |
| `PATCH` | `/users/:id` |

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file and fill in values:

```bash
cp .env.example .env
```

```env
NODE_ENV=development
PORT=4000
API_PREFIX=/api/v1
CLIENT_ORIGIN=http://localhost:3000
MONGODB_URI=your_mongodb_uri
MONGODB_DB_NAME=expense_tracker
JWT_SECRET=your_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_TTL_DAYS=30
BCRYPT_SALT_ROUNDS=10
```

3. Start dev server:

```bash
npm run dev
```

Runs on `http://localhost:4000`.

## Seed Data

Creates 3 demo users and sample financial records:

```bash
npm run seed -- --clear --count 2000
```

Demo credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@walletwhiz.dev` | `password123` |
| Analyst | `analyst@walletwhiz.dev` | `password123` |
| Viewer | `viewer@walletwhiz.dev` | `password123` |

## Project Structure

```
src/
  config/       # env and database bootstrapping
  constants/    # roles and shared constants
  middleware/   # auth, validation, error handling
  modules/
    auth/       # login, refresh, logout, current user
    users/      # user management
    records/    # financial record CRUD and filtering
    dashboard/  # aggregations and trend data
  scripts/      # seed and demo data scripts
  utils/        # shared helpers
api/
  index.ts      # Vercel serverless entry point
```
