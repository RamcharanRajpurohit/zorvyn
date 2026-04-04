# WalletWhiz Backend

A standalone finance data processing and access control backend built with Node.js, Express, TypeScript, MongoDB, and Mongoose.

This backend was created as a clean assessment-ready service that focuses on:

- role-based access control
- financial record CRUD and filtering
- summary and analytics APIs
- validation and structured error handling
- maintainable module separation

## Stack

- Node.js
- Express
- TypeScript
- MongoDB + Mongoose
- JWT access tokens + rotating refresh sessions
- Zod validation

## Project Structure

```text
backend/
  src/
    config/          # env and database bootstrapping
    constants/       # roles and shared constants
    middleware/      # auth, validation, errors
    modules/
      auth/          # login, bootstrap admin, current user
      users/         # user management and status updates
      records/       # financial record CRUD + filtering
      dashboard/     # summary, trends, category totals
    scripts/         # local seed script
    utils/           # shared helpers
```

## Role Model

| Role | Capabilities |
|------|--------------|
| `viewer` | Can access dashboard summary APIs only |
| `analyst` | Can access dashboard APIs and read financial records |
| `admin` | Full access to users and financial records |

Inactive users cannot log in or access protected APIs.

## API Base

Default base path:

```text
/api/v1
```

## Main Endpoints

### Auth

- `POST /api/v1/auth/bootstrap-admin`
  Creates the first admin when the system has no users and issues an authenticated session.
- `POST /api/v1/auth/login`
  Returns a short-lived JWT access token, a rotating refresh token, and the authenticated user.
- `POST /api/v1/auth/refresh`
  Rotates the refresh token and returns a fresh access-token pair.
- `POST /api/v1/auth/logout`
  Revokes the submitted refresh-token session.
- `GET /api/v1/auth/me`
  Returns the current authenticated user.

### Users

Admin only.

- `GET /api/v1/users`
- `POST /api/v1/users`
- `GET /api/v1/users/:id`
- `PATCH /api/v1/users/:id`

Supports:

- role assignment
- active or inactive user status
- password updates
- paginated user listing

### Financial Records

- `GET /api/v1/records`
  Accessible by `admin` and `analyst`
- `GET /api/v1/records/:id`
  Accessible by `admin` and `analyst`
- `POST /api/v1/records`
  Admin only
- `PATCH /api/v1/records/:id`
  Admin only
- `DELETE /api/v1/records/:id`
  Admin only

Supported filters:

- `page`
- `limit`
- `type`
- `category`
- `from`
- `to`
- `search`
- `sortBy`
- `sortOrder`

Delete uses soft deletion through `isDeleted`.

### Dashboard

- `GET /api/v1/dashboard/overview`
  Accessible by `viewer`, `analyst`, and `admin`

Returns:

- total income
- total expenses
- net balance
- total record count
- category totals
- trend data
- recent activity

Query params:

- `from`
- `to`
- `recentLimit`
- `trend` = `daily | weekly | monthly`

### Health

- `GET /health`

## Local Setup

1. Copy the environment file:

```bash
cp .env.example .env
```

2. Fill in `MONGODB_URI`, `MONGODB_DB_NAME`, and `JWT_SECRET`.

3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

The backend runs on `http://localhost:4000` by default.

## Environment Variables

```env
NODE_ENV=development
PORT=4000
API_PREFIX=/api/v1
CLIENT_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/walletwhiz_backend
MONGODB_DB_NAME=expense_tracker
JWT_SECRET=change-this-in-real-use
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_TTL_DAYS=30
BCRYPT_SALT_ROUNDS=10
```

## Seed Data

This project includes a local seed script that creates:

- 1 admin user
- 1 analyst user
- 1 viewer user
- 2000 sample financial records across the recent 3 months

Run it with:

```bash
npm run seed -- --clear --count 2000
```

Demo credentials after seeding:

- `admin@walletwhiz.dev` / `password123`
- `analyst@walletwhiz.dev` / `password123`
- `viewer@walletwhiz.dev` / `password123`

## Assumptions

- JWT authentication with rotating refresh sessions is sufficient for this assessment backend.
- This backend is single-tenant for simplicity.
- Viewer users can access dashboard analytics but not raw records.
- Analyst users can inspect records but cannot mutate them.
- Admins manage users and records.

## Verification

The implementation has been compiled successfully with:

```bash
npm run build
```

## Frontend Integration

This backend has already been integrated with a cloned frontend app in the sibling project:

```text
Zorvyn/
  backend/
  walletwhiz/
```

The integrated frontend uses this backend for:

- login and current-user session lookup
- dashboard data
- records listing and CRUD
- reports and trend data

For the separate frontend-only assignment, the original standalone UI project can still be submitted independently.
