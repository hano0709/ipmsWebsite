# IPMS Frontend (Insurance Policy Management System)

Angular web client for the IPMS backend. It provides role-based portals for **Admin**, **Agent**, and **Customer** users to manage insurance policies end to end.

> The Spring Boot backend lives in a separate repository: **[IPMS Backend](https://github.com/hano0709/IPMS)**. It must be running before you use this app.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (standalone components, zoneless change detection, lazy-loaded routes) |
| UI | Bootstrap 5, PrimeNG 21 (Aura theme), PrimeIcons |
| HTTP / Auth | `HttpClient` with functional interceptors, JWT |
| Testing | Jasmine, Karma |
| Linting / Formatting | ESLint (angular-eslint), Prettier |

## Features

- **Login** with role-based redirect to the Admin, Agent, or Customer portal.
- **Route guards** for Admin and Agent areas; unauthorized access redirects to `/unauthorized`.
- **Auth interceptor** attaches the JWT to every request.
- **Refresh interceptor** silently refreshes an expired access token on a `401` and retries the request.
- **Dashboards** with KPI cards per role (total, active, and expiring policies; customer count for Admin).
- **Policy management**: list, create, view details, and run lifecycle actions (activate, renew, suspend, cancel).
- **Audit trail** per policy.
- **Document upload and download** on policy details.
- **Customer and agent management** (Admin), customer management (Agent).
- **Notifications** page and bell indicator for policy state changes.
- **Breadcrumb navigation** driven by route data.

## Portals

| Role | Routes |
|---|---|
| Admin | `/admin/dashboard`, `/admin/policies`, `/admin/policies/create`, `/admin/policies/:policyNumber`, `/admin/customers-agents`, `/admin/notifications` |
| Agent | `/agent/dashboard`, `/agent/policies`, `/agent/policies/create`, `/agent/policies/:policyNumber`, `/agent/customers`, `/agent/notifications` |
| Customer | `/customer/dashboard`, `/customer/policies`, `/customer/policies/:policyNumber`, `/customer/notifications` |

Authorization is enforced by the backend. The route guards are a UX layer on top.

## Prerequisites

- Node.js 20.19+ (or 22.12+)
- npm 10+
- The IPMS backend running at `https://localhost:8080`

## Setup

### 1. Clone and install

```bash
git clone https://github.com/hano0709/ipmsWebsite.git
cd ipmsWebsite
npm install
```

### 2. Start the backend

Follow the backend README. The API must be reachable at `https://localhost:8080/api/v1`.

The backend uses a self-signed certificate. **Open `https://localhost:8080/api/v1/health` once in your browser and accept the certificate warning**, otherwise the app's API calls will fail.

### 3. Run the app

```bash
npm start
```

Open `http://localhost:4200`. This origin is the only one allowed by the backend's CORS configuration, so don't change the port.

### 4. Log in

Use an account created through the backend (see "Creating the first users" in the backend README). You are redirected to the portal matching your role.

## Configuration

The API base URL is `https://localhost:8080/api/v1`, set inside the services and interceptors under `src/app/`. To point at a different backend, update the URL there and make sure the backend's CORS configuration allows your frontend origin.

## Scripts

| Command | Description |
|---|---|
| `npm start` | Dev server on port 4200 with live reload |
| `npm run build` | Production build into `dist/` |
| `npm run watch` | Development build in watch mode |
| `npm test` | Unit tests (Karma + Jasmine, requires Chrome) |
| `npm run lint` | ESLint |

## Project Structure

```
src/app/
├── component/
│   ├── admin/          Admin shell, dashboard, policies, customers & agents
│   ├── agent/          Agent shell, dashboard, policies, customers
│   ├── customer/       Customer shell, dashboard, policies
│   ├── login/          Login page
│   ├── notification/   Shared notifications page
│   └── unauthorized/   Access denied page
├── guards/             Admin and Agent route guards
├── interceptors/       JWT attach and token refresh interceptors
├── interface/          TypeScript models matching backend DTOs
├── service/            User and notification services
├── app.routes.ts       Route table (lazy-loaded children)
└── app.config.ts       Providers (router, HttpClient, PrimeNG theme)
```

## Authentication Flow

1. `POST /auth/login` returns an access token and a refresh token, both stored in `localStorage`.
2. `AuthInterceptor` adds `Authorization: Bearer <token>` to outgoing requests.
3. On a `401`, `RefreshInterceptor` calls `POST /auth/refresh`, stores the new tokens, and retries the original request.
4. Logout revokes the refresh token on the backend and clears both tokens locally.

## Demo Flow

1. Log in as **Admin** and review the dashboard KPIs.
2. Add an agent and a customer under Customers & Agents.
3. Create a policy and check the calculated premium.
4. Upload a document, then activate the policy.
5. Open the audit trail and notifications to show the state change.
6. Renew, suspend, or cancel to show lifecycle transitions.
7. Log in as **Customer** and show the restricted, own-data-only view.
