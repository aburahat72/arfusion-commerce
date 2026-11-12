# ARFusion Commerce

ARFusion Commerce is a full-stack e-commerce application with a customer storefront and a separate admin workspace. The frontend is a React/Vite application and the backend is an Express API backed by MongoDB and Mongoose.

> **Project status:** Active development. Check the known limitations and setup notes below before diagnosing a feature as broken.

## Contents

- [What the application does](#what-the-application-does)
- [How the application is organized](#how-the-application-is-organized)
- [Project structure](#project-structure)
- [Requirements](#requirements)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Useful commands](#useful-commands)
- [API map](#api-map)
- [Troubleshooting and known limitations](#troubleshooting-and-known-limitations)
- [Safe development checklist](#safe-development-checklist)

## What the application does

### Customer storefront

- Browse products and categories, view product details, and use cart, wishlist, and product comparison features.
- Register, sign in, and manage a profile, addresses, and order history.
- Check out and pay through Razorpay.
- View orders and request supported return or cancellation actions.

### Admin workspace

- View dashboard, analytics, and reports.
- Manage products, categories, banners, and deals of the day.
- Manage orders, inventory, customers, reviews, and coupons.
- Review return requests and update order statuses.

These features are implemented across the frontend pages and backend route/controller modules. Availability of third-party features such as payments, email, and image uploads depends on valid credentials and service configuration.

## How the application is organized

```text
Browser
  |
  | React Router pages, auth contexts, Redux / React Query state
  v
Axios services (VITE_API_URL)
  |
  | HTTP requests under /api
  v
Express server (default port 3000)
  |-- authentication, validation, rate limiting, uploads
  |-- controllers and Mongoose models
  |-- MongoDB
  |-- Socket.IO (JWT-authenticated customer/admin rooms)
  |-- Razorpay, Cloudinary, SMTP (when configured)
```

### Request and state flow

1. `client/src/main.jsx` mounts the app with Redux, React Query, and separate customer/admin authentication providers.
2. `client/src/routes/AppRoutes.jsx` selects a page and layout. `ProtectedRoute` guards customer pages; `AdminRoute` guards admin pages.
3. Frontend API services use Axios and `VITE_API_URL`. Customer and admin requests attach their own saved bearer token.
4. `server/server.js` configures Express middleware and mounts the feature routers under `/api`.
5. Routers apply authentication, validation, and upload middleware before calling controllers. Controllers read/write Mongoose models and return API responses.

Customer and admin authentication are intentionally separate. The backend verifies them with separate JWT secrets; never substitute one secret or token for the other.

## Project structure

```text
arfusion-commerce/
|-- client/                         React + Vite storefront and admin UI
|   |-- src/
|   |   |-- components/             Shared UI and feature components
|   |   |   `-- realtime/           Authenticated live event bridge
|   |   |-- context/                Customer and admin auth state
|   |   |-- data/                   Static/demo UI data
|   |   |-- layouts/                Main, auth, and admin shells
|   |   |-- pages/                  Customer, auth, and admin screens
|   |   |-- routes/                 Route table and access guards
|   |   |-- services/               Axios API calls by feature
|   |   |-- store/                  Redux store and cart/checkout/etc. slices
|   |   |-- utils/                  Auth storage and shared helpers
|   |   |-- App.jsx                 Route entry component
|   |   |-- main.jsx                React providers and app bootstrap
|   |   `-- index.css               Global styles
|   |-- index.html
|   |-- vite.config.js
|   `-- package.json
|-- server/
|   |-- server.js                   Express setup, middleware, route mounting
|   |-- src/
|   |   |-- config/                 MongoDB, mail, payment, and Cloudinary setup
|   |   |-- controllers/            Request handlers and business logic
|   |   |-- middleware/             Auth, validation, rate limits, file uploads
|   |   |-- models/                 Mongoose data models
|   |   |-- routes/                 HTTP routes grouped by feature
|   |   |-- realtime/               Socket.IO authentication and room emitters
|   |   |-- services/               Shared email/notification services
|   |   |-- templates/              Transactional email templates
|   |   |-- utils/                  Checkout validation and shared helpers
|   |   `-- validations/            Zod request schemas
|   |-- test/                       Backend unit tests
|   |-- .env.example                Server environment template
|   `-- package.json
`-- README.md
```

### Where to look when changing a feature

| Change                                     | Start here                                             |
| ------------------------------------------ | ------------------------------------------------------ |
| Customer/admin screen or route             | `client/src/pages/`, `client/src/routes/AppRoutes.jsx` |
| Frontend API request                       | `client/src/services/`                                 |
| Customer/admin login state                 | `client/src/context/`, `client/src/utils/`             |
| Cart, checkout, wishlist, or compare state | `client/src/store/`                                    |
| API URL and middleware setup               | `server/server.js`                                     |
| API endpoint and access rules              | `server/src/routes/`                                   |
| Business logic                             | `server/src/controllers/`                              |
| Database fields and relationships          | `server/src/models/`                                   |
| Input validation                           | `server/src/validations/`                              |
| Email or notification behavior             | `server/src/services/`, `server/src/templates/`        |
| Database/third-party connection            | `server/src/config/`                                   |

## Requirements

- Node.js 20 or newer.
- npm (lockfiles are provided for both applications).
- A running MongoDB instance, local or hosted.
- MongoDB must run as a replica set (including local development) for checkout, cancellation, refunds, replacement, and support-ticket message transactions.
- Optional service accounts/credentials for Razorpay, Google OAuth, Cloudinary, and SMTP email.

## Local setup

Open two terminals from the `arfusion-commerce` directory.

### 1. Install dependencies

```powershell
cd server
npm install
cd ..\client
npm install
```

### 2. Configure the backend

Copy `server/.env.example` to `server/.env` and set the variables needed by the features you will use. Make sure MongoDB is reachable and configured as a replica set; multi-document transactions are required for stock and order consistency.

### 3. Configure the frontend

Copy `client/.env.example` to `client/.env.local` and configure:

```dotenv
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=
```

`VITE_API_URL` must include `/api`; frontend service paths (for example `/products`) are appended to it. Configure the same Google OAuth web client ID as `GOOGLE_CLIENT_ID` in the server environment. Google sign-in is hidden until the client ID is configured.

### 4. Start the server and frontend

In the first terminal:

```powershell
cd server
npm run dev
```

In the second terminal:

```powershell
cd client
npm run dev
```

Open the Vite URL printed in the client terminal (normally `http://localhost:5173`). The backend health response is available at `http://localhost:3000/`.

## Environment variables

### Server (`server/.env`)

Copy `server/.env.example` and fill in the required values. Keep real credentials out of source control.

```dotenv
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ARfusion?replicaSet=rs0
CLIENT_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173

# Use different, long, random values for customer and admin auth.
CUSTOMER_JWT_SECRET=replace-with-a-long-random-secret
ADMIN_JWT_SECRET=replace-with-a-different-long-random-secret

# Google OAuth web client ID; use the same value in the frontend.
GOOGLE_CLIENT_ID=

# Razorpay test credentials; required for payment flows.
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Cloudinary credentials; required for product image uploads.
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# SMTP credentials; required for email delivery.
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="ARFusion Commerce <your-email@example.com>"
```

Set `CORS_ORIGINS` to a comma-separated allowlist of trusted browser origins in deployment. `CLIENT_URL` is used for links and is also added to the CORS allowlist. Use distinct, long random values for the customer and admin JWT secrets.

### Client (`client/.env.local`)

```dotenv
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=
```

Vite exposes variables prefixed with `VITE_` in browser code. Do not put private credentials in client environment variables.

## Useful commands

Run commands from the corresponding `client` or `server` directory.

| Command           | Directory | Purpose                                           |
| ----------------- | --------- | ------------------------------------------------- |
| `npm run dev`     | `client`  | Start Vite development server                     |
| `npm run build`   | `client`  | Create production frontend build in `client/dist` |
| `npm run preview` | `client`  | Preview the production build locally              |
| `npm run lint`    | `client`  | Run ESLint on the frontend                        |
| `npm run dev`     | `server`  | Start API with Nodemon                            |
| `npm start`       | `server`  | Start API with Node                               |
| `npm test`        | `server`  | Run backend unit tests                            |
| `npm run migrate:review-indexes` | `server` | Replace the legacy review uniqueness index        |

The backend tests cover checkout quantity normalization and analytics date-range validation. Database/payment workflows require configured MongoDB replica-set and Razorpay test credentials for integration testing.

Customer support provides paginated private ticket conversations, optional customer-owned order references, unread tracking, assignment, priorities, status management, and admin-only internal notes. Ticket creation and replies use MongoDB transactions, so support requires a replica set. AI responses are intentionally not enabled; an AI provider can be added later without changing ticket ownership or authorization.

Before deploying the order-verified reviews feature to a database that has used the previous review model, back up the database and run `npm run migrate:review-indexes` from `server`. The migration removes legacy reviews without order provenance from public display, replaces the old uniqueness index, and creates the minimal review claims used to preserve one-time submissions after permanent deletion. New customer reviews can only be submitted for products in delivered orders, are unique per order and product, and remain hidden until an admin approves them.

## API map

All API routes are mounted under `/api`. The home route `GET /` is a simple server health/availability response.

| Prefix                             | Responsibility                                            |
| ---------------------------------- | --------------------------------------------------------- |
| `/api/auth/customer`               | Customer registration, login, and profile                 |
| `/api/auth/admin`                  | Admin authentication                                      |
| `/api/admin/customers`             | Admin customer management                                 |
| `/api/products`                    | Public product browsing and admin product management      |
| `/api/categories`                  | Category browsing and management                          |
| `/api/banners`                     | Public banners and admin banner management                |
| `/api/cart`, `/api/wishlist`       | Customer cart and wishlist                                |
| `/api/addresses`                   | Customer addresses                                        |
| `/api/orders`                      | Customer orders and admin order management                |
| `/api/support`                     | Private customer support tickets and admin conversations |
| `/api/payments`                    | Razorpay order creation, verification, and payment status |
| `/api/reviews`, `/api/coupons`     | Reviews and coupons                                       |
| `/api/returns`, `/api/inventory`   | Returns and stock management                              |
| `/api/notifications`               | Notifications                                             |
| `/api/deals`                       | Deal-of-the-day                                           |
| `/api/dashboard`, `/api/analytics` | Admin dashboard and analytics                             |

For exact methods, request schemas, and middleware, inspect the matching file in `server/src/routes/`. Route definitions are the source of truth.

Customer Google sign-in verifies a Google ID token on the server and only links accounts after Google confirms the email. Admin sign-in remains on its separate password/JWT flow. Socket.IO connections use those same role-specific JWT secrets; clients cannot choose or join rooms themselves.

Online checkout creates a temporary payment intent, verifies the Razorpay signature and captured payment, then atomically creates the order and deducts stock. The COD endpoint accepts COD only. Return requests require a delivered order inside its eligibility window; paid online refunds are not recorded as refunded until Razorpay confirms a full refund. Inventory updates, cancellations, and replacement/refund stock changes use transactions.

## Troubleshooting and known limitations

| Symptom / observed limitation                                   | Likely cause                                                                                                                                                                         | Solution or next check                                                                                                                                                                                                                                                           |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend requests fail, or banners/deals show no data           | `client/src/services/customerApi.js` and `adminApi.js` require `VITE_API_URL`; the banner and deal services otherwise fall back to port `5000`, while the server defaults to `3000`. | Set `VITE_API_URL=http://localhost:3000/api` in `client/.env.local`, restart Vite, and check the browser Network tab for the actual request URL.                                                                                                                                 |
| Browser reports a CORS error outside local development          | The browser origin is missing from the backend allowlist.                                                                                                                          | Set `CLIENT_URL` and `CORS_ORIGINS` to the exact trusted origins in `server/.env`, then restart the API. Do not use wildcard origins with credentials.                                                                                                                          |
| Admin login or customer login fails with token/signature errors | One JWT variable is missing, or customer/admin secrets have been confused.                                                                                                          | Set both `CUSTOMER_JWT_SECRET` and `ADMIN_JWT_SECRET` in `server/.env`; restart the API and sign in again to issue fresh tokens.                                                                                                                                                 |
| Server exits while connecting to MongoDB                        | MongoDB is stopped, `MONGODB_URI` is missing/incorrect, or the database host is unreachable.                                                                                         | Start/check MongoDB, verify the URI and network access, then read the API terminal output. The server intentionally exits if its database connection fails.                                                                                                                      |
| Product image upload fails                                      | Cloudinary credentials are absent/incorrect, the file is not an allowed image type, or it exceeds the 5 MB upload limit.                                                             | Set all three `CLOUDINARY_*` variables, use JPG/JPEG/PNG/WEBP/GIF, keep each file under 5 MB, and inspect the server log for the Cloudinary error.                                                                                                                               |
| Payment creation or verification fails                          | Razorpay credentials are missing, test/live keys do not match the environment, or credentials are invalid.                                                                           | Configure matching Razorpay key ID and secret in the server environment. Use test keys for local development; never expose the secret in the client.                                                                                                                             |
| Google sign-in is missing or rejected                           | The frontend Google client ID is unset, the server audience differs, or the OAuth token has an unverified email.                                                                     | Configure matching `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` values and register the exact development/deployment origin with Google. Admin accounts must use admin sign-in.                                                                                                 |
| Checkout/cancellation/refund fails with a transaction error      | MongoDB is running standalone rather than as a replica set.                                                                                                                          | Configure a MongoDB replica set for local or hosted development, restart the database/API, and retry. Do not disable transactions; they protect order and inventory consistency.                                                                                                |
| Live updates do not arrive                                       | The socket token is missing/expired, the browser origin is not allowed, or the frontend API URL points to a different server.                                                        | Sign in again, configure `CLIENT_URL`/`CORS_ORIGINS`, confirm `VITE_API_URL`, then inspect the browser Network panel for the Socket.IO connection and server logs.                                                                                                               |
| Email or reset instructions are not delivered                   | SMTP settings are incomplete, or a frontend-only screen is mistaken for a working backend feature.                                                                                   | Configure SMTP and check server startup/email logs. **Password reset is not wired end-to-end:** the screen exists, but the customer auth router currently exposes only register, login, and profile. Add and test reset-token endpoints and email handling before relying on it. |
| `EADDRINUSE` when starting either app                           | Another process is already listening on the requested port.                                                                                                                          | Stop the other development server or choose an unused port; if changing the API port, update `VITE_API_URL` and the backend CORS allowlist together.                                                                                                                             |
| Changes to `.env.local` have no effect                          | Vite reads env values at startup.                                                                                                                                                    | Stop and restart `npm run dev`; confirm the variable is named `VITE_API_URL` and includes `/api`.                                                                                                                                                                                |
| A protected route redirects to login or returns 401/403         | Missing/expired token, wrong customer/admin token, inactive admin, or insufficient role.                                                                                             | Sign in with the appropriate account, inspect the request Authorization header and API response, and verify the account role/status in the database. Do not bypass the backend guard to fix an authorization error.                                                              |
| `npm run lint` reports frontend errors                          | ESLint found code issues; this is separate from API runtime errors.                                                                                                                  | Run it from `client`, follow the reported file/line, then run `npm run build` to confirm the frontend still compiles.                                                                                                                                                            |
| A secret could be committed accidentally                        | Environment files may have been tracked before ignore rules were added.                                                                                                               | Keep `.env` files ignored and commit only `.env.example`. Check Git history for previously committed credentials; rotate any exposed credentials with their providers, and handle history cleanup separately.                                                                        |

### A quick debugging sequence

1. Confirm MongoDB is reachable and the server has started successfully.
2. Open `http://localhost:3000/`; if it does not respond, check the server terminal first.
3. Confirm `client/.env.local` points to the correct API origin and ends with `/api`, then restart Vite.
4. In browser DevTools, inspect the failed request URL, status code, response body, and CORS/network errors.
5. Match the endpoint to its route, controller, validation schema, and model under `server/src/`.
6. Check server logs for the corresponding request and integration error. Do not paste secrets or customer data into issue reports.

## Safe development checklist

- Keep server credentials in `server/.env`; keep frontend configuration in `client/.env.local`. Never put private keys in `VITE_*` variables.
- Use separate, strong customer and admin JWT secrets.
- Use Razorpay test credentials locally.
- Use a MongoDB replica set so checkout, cancellations, refunds, and replacements can commit their related order/inventory changes atomically.
- Configure Google OAuth with the same web client ID on the browser and server; never trust a client-supplied email as proof of identity.
- Do not commit `.env` files, API keys, tokens, database credentials, or customer data. Verify Git ignore/tracking status before pushing.
- Preserve backend authorization and validation when adding or changing frontend controls; hiding a button is not access control.
- Update this guide and the relevant route/service docs when introducing new services, environment variables, or major features.
