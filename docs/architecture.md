# architecture.md — Project Architecture

This project follows an FSD-style layered architecture.

Top-level layers under `src/`: `app/` (Next.js App Router + BFF route handlers), `features/`, `entities/`, `shared/` (largest — `api`, `lib`, `components`, `constants`, `ui`, …), `store/`, `providers/`, `layout/`, `config/`, `mocks/`, `types/`, `styles/`, `assets/`.

App Router route groups (`src/app/`): `(auth)`, `(home)`, `(private)` (includes `admin`), `(profile)`, `(public)`.

---

## Data Flow

Calls must always flow in this direction. Do not skip or reverse layers.

Step 1. UI (features)
Step 2. domain (entities/core)
Step 3. repository (entities/infrastructure)
Step 4. api client (shared/api/http)
Step 5. backend

---

## API Clients

`shared/api/http` exposes one wrapper `api` object over four axios instances (`shared/api/http/http.transport.ts`):

- `api.public` — requests that do not require authentication (`withCredentials: false`).
- `api.private` — requests that require authentication. Auth is carried by HttpOnly cookies (`withCredentials: true`); on the browser it targets `/api/v1` and the BFF catch-all route attaches cookies and proxies to the backend. The 401-refresh/redirect interceptor (`shared/api/http/interceptors.ts`) is installed on `api.private` only.
- `api.bff.client` — browser → BFF (Next.js route handlers under `app/api/v1/**`). Used by auth/member/dashboard flows.
- `api.bff.server` — server (route handler) → backend.

Both `api.bff.client` and `api.bff.server` are in active use (e.g. `entities/member/infrastructure/member.repository.ts`, `app/api/v1/dashboard/route.ts`, the auth flows). They are part of the BFF design, not deprecated.

---

## Rules

Rule 1. API calls must NOT be placed inside `features`.
Rule 2. All API calls must be implemented at `entities/{domain}/infrastructure/` (the repository file — named `{domain}.repository.ts` or `{domain}.api.repository.ts` depending on the entity).

> Note: dependency direction is a convention only. It is NOT enforced by ESLint (`eslint.config.mjs` has no import-boundary rule).
