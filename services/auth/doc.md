# Authentication Microservice Project Proposal

## 1. Project Overview

This project is an **authentication microservice** that other microservices in the system will use for authentication and authorization functionality. Performance is critical, as this service will be called frequently by other services to validate and authorize users.

The system must provide secure JWT-based authentication with refresh tokens, role-based access control (RBAC), and claims hierarchy management.

---

## 2. Domain Model

### 2.1 User

- Each user has:
  - `userId`
  - `roles` (one or more)
  - `claims` (see below)
- Users can register and login via API endpoints.

### 2.2 Roles

- Roles are predefined sets of claims.
- Example: `ProductManager` role automatically includes the `ProductService` claim.
- CRUD operations are required for roles:
  - Create, Read, Update, Delete
  - Assign claims to roles

### 2.3 Claims

- Claims are hierarchical:
  - **Service claim** → top-level claim
  - **Controller claim** → under a service
  - **Action claim** → under a controller
- Rules:
  - If a user has a service claim, they automatically have access to all its controllers and actions.
  - If a user has a controller claim, they have access to its actions.
  - Action claims are checked at the end for fine-grained authorization.
- CRUD operations are required for claims:
  - Create, Read, Update, Delete
- **Claim tree endpoint**: External services can fetch the hierarchical tree of claims at startup to perform authorization based on tokens.

---

## 3. Authentication & Authorization (implemented model)

### 3.0 Trust chain
1. **Gateway** verifies the JWT (shared `JWT_ACCESS_SECRET`) and is the ONLY party allowed to set `x-user-*` headers. Any client-supplied `x-user-*` headers are stripped; identity headers are re-derived from the verified token: `x-user-id`, `x-user-role`, `x-user-permissions` (JSON array).
2. Every service guards its routes **secure by default**:
   - `config: { public: true }` (Fastify) / `@Public()` (NestJS) → unauthenticated access (login flow).
   - `auth: { authenticatedOnly: true }` → any valid identity, no permission needed (self endpoints).
   - otherwise → identity required (401 without), then authorization (403 without a covering grant).
   - A Fastify route without any rule fails fast at boot.
3. **Admin role always has access to all.**
4. Grants are hierarchical with dot-segment boundaries: a service grant covers all controllers/actions; a controller grant covers its actions; `A.B` never covers `A.Bx`.
5. Grant sources, in order: token claims (fast path) → local `RolePermission` mirror (fresh fallback; the auth service reads its own `RolePermission` + `UserPermission` tables directly).
6. User-custom grants (UserPermission) live only in the auth DB and travel via token claims — a revocation propagates at most one access-token TTL (15m) later, or immediately on the next refresh.

### 3.1 JWT Access Tokens
- Tokens include payload: `userId`, `role`, `permissions` (granted names only — role grants ∪ user grants, never children) and `typ: "access"`.
- Access tokens live **15 minutes** (short window: rotations happen often, revoked claims propagate fast).
- Claims are computed at **every** issuance: `VerifyOtp` and `Refresh` both re-read the user from the DB, so role/grant changes take effect at most one refresh later (no frozen-role chains).

### 3.2 Refresh Tokens (persisted, rotated, revocable)
- Every refresh token carries a unique `jti` and `typ: "refresh"`; it lives **7 days**.
- Every issued token has a `RefreshToken` DB row (`jti`, `userId`, `expiresAt`, `revokedAt`, `replacedByJti`, `ip`, `userAgent`). The row is created **before** the JWT is signed (fail-closed: no row, no token).
- **Rotation on every use**: `Refresh` retires the presented token (revoked + linked to its successor) and issues a new one. A token can therefore only be used **once**; the client's mutex prevents double-refresh races.
- **Reuse detection**: presenting an already-rotated token is treated as theft — every live session of that user is revoked and the request gets 401. The same happens to the successor of a replayed token.
- Unknown `jti` (well-signed but no row) → 401. Legacy tokens without `jti` (issued before this model) → 401, holders log in again once.
- **Logout** (`POST /Auth/Logout`, authenticatedOnly): revokes the caller's own refresh token; idempotent; a token belonging to another user is never revoked. Access tokens stay valid until they expire (≤ 15m) — no blacklist yet.
- **Pruning**: expired rows (whose tokens are already unverifiable via JWT `exp`) are swept every 6h.
- Rollout note: deploying this model invalidates all pre-existing refresh sessions (one re-login per user).

### 3.3 OTP (throttled, single-use)
- Codes are always **real `randomInt`** 6-digit values (the old `"123456"` dev constant is gone). In development the code is logged to the server console instead of being sent by SMS (no SMS provider yet); in every other environment it never leaves the process except through the OTP key.
- Per-mobile throttling (Redis): 60s resend cooldown, max 3 sends / 10 min window, TTL 120s per code.
- Per-code lockout: max 5 wrong `VerifyOtp` attempts; the 5th miss voids the code and forces a new `SendOtp`. Successful use burns the code immediately (no replay).

### 3.4 Permission registry
- Each service declares its action permissions on its routes (Fastify `onRoute` collection / NestJS reflection over controller prototypes / Express permission constants) and publishes the derived list (service → controllers → actions) to the auth service's global catalog via the permission-sync RMQ flow.
- The auth service also registers its own routes in the catalog (it guards itself like any other service).

### 3.5 Role & permission management (admin)
- The global catalog (`PermissionReference`) is exposed read-only via `GET /Auth/PermissionReferences`; the role enum via `GET /Auth/Roles`. Together they drive the admin **Roles & Permissions** screen (`client/app/admin/roles`).
- `GET /Auth/RolePermissions/Role/:role` returns one role's full grant list (seed state for the UI).
- `PUT /Auth/RolePermissions` **replaces** a role's grants with the submitted list in one atomic save:
  1. every submitted name must exist in the catalog (fail-closed against typos),
  2. only the real diff (adds/removes) hits the database, inside a single transaction,
  3. after commit, the same create/delete RMQ events the single-grant endpoints emit are fanned out, so every service's local mirror stays consistent.
- The single-grant endpoints (`POST` / `DELETE /Auth/RolePermissions…`) remain available for fine-grained use.
- Effect latency: grant changes appear in a user's token claims at their next refresh (or immediately via the mirror fallback) and always after ≤ 15 minutes (access-token TTL).
- The Admin role bypasses all checks, so its tab in the UI is read-only (informational).

### 3.6 User grant management (admin)
- `GET /Users/Admin` lists users with their role (paginated, searchable by mobile); `GET /Users/:id/GetUserPermissions` returns one user's personal grants. Together they seed the admin **Users & Permissions** screen (`client/app/admin/users`).
- The screen also exposes `POST /Users/:id/SetRole` (role select) — a role change re-derives the role half of that user's coverage and applies at their next refresh.
- `PUT /Users/:id/SyncUserPermissions` **replaces** a user's personal grants in one atomic save (the user-grant twin of the role bulk sync):
  1. the target user must exist; every submitted name must exist in the catalog (fail-closed),
  2. only the real diff (adds/removes) hits the database, inside a single transaction.
- **No RMQ fan-out for user grants**: they live only in the auth database and surface as JWT claims (re-derived at issue/refresh), so there is nothing to mirror downstream. Effective access = role grants ∪ personal grants; the change reaches the user's token at their next refresh (≤ 15 min worst case).
- The UI renders the union: rows covered by the role are locked and badged `from role`; direct personal grants are badged `user grant`; rows covered by a broader personal grant are badged `inherited`. Users with the Admin role are read-only (Admin bypasses every check).
- The single-grant endpoints (`POST` / `DELETE /Users/:id/…`) remain available for fine-grained use.

---

## 4. API Endpoints (as implemented; gateway prefix `/Auth-Api`)

### 4.1 Authentication

- `POST /Auth/SendOtp` – **public**, throttled (60s cooldown, 3 sends/10min per mobile); 204; code logged in dev
- `POST /Auth/VerifyOtp` – **public**; 5-attempt lockout; issues a token pair and persists the refresh row
- `POST /Auth/Refresh` – **public** (the refresh token is the credential); rotates + re-derives claims; replays revoke all sessions
- `POST /Auth/Logout` – **authenticatedOnly**; revokes the caller's own refresh token (idempotent)

### 4.2 Users & permissions (guarded)

- `GET /Users` – own context (authenticatedOnly; includes the role)
- `GET /Users/Admin` – list users with role (`auth.UserController.GetManyUsers`; backs the admin UI)
- `POST /Users/:id/SetRole` – change a user's role (`…SetUserRole`; backs the admin UI role select)
- `POST /Users/:id/AddUserPermission` / `DELETE /Users/:id/DeleteUserPermission`, `GET /Users/:id/GetUserPermissions` (`…AddUserPermission` / `…DeleteUserPermission` / `…GetUserPermissions`)
- `PUT /Users/:id/SyncUserPermissions` – bulk-sync a user's personal grants (`…SyncUserPermissions`; backs the admin UI save)

### 4.3 Role-permission management (guarded; backs the admin UI)

- `GET /Auth/RolePermissions` – paginated listing (`auth.AuthController.GetRolePermissions`)
- `GET /Auth/RolePermissions/Role/:role` – one role's full grant list (`…GetRolePermissionsByRole`)
- `GET /Auth/PermissionReferences` – the global permission catalog (`…GetPermissionReferences`)
- `GET /Auth/Roles` – the role enum (`…GetRoles`)
- `PUT /Auth/RolePermissions` – bulk-sync a role's grants (`…SyncRolePermissions`)
- `POST /Auth/RolePermissions` / `DELETE /Auth/RolePermissions/:id` – single-grant create/delete (`…CreateRolePermission` / `…DeleteRolePermission`)

### 4.4 Legacy roadmap sections removed

The original proposal’s generic `/claims` and `/roles` CRUD sections were superseded by the implemented model above (see 4.1/4.2).

---

## 5. Technical Implementation

### 5.1 Technology Stack

- **Node.js 24** with **Fastify** (performance critical)
- **TypeScript** for type safety
- **Prisma ORM** for database interactions
- **Zod** for request validation
- **Caching system** for cacheable scopes and claims

### 5.2 Architecture

- **Procedural and modular design**
- **Layers:**
  - **Controller** – handles HTTP requests and responses
  - **Service** – business logic
  - **Domain** – entities, models
  - **Infrastructure** – database access, cache, external service integration
- **Communication:**
  - Controllers communicate with services
  - Services communicate with infrastructure
- Use a **high-performance DTO mapping system** to convert entities to DTOs efficiently.

### 5.3 Performance Considerations

- Minimize token size by including only top-level claims.
- Use caching for frequently accessed claim trees.
- Keep architecture modular to optimize request handling.
- Avoid heavy frameworks; plain Fastify for minimal overhead.

---

## 6. Future Considerations

- SMS provider integration for OTP delivery (currently dev-console logging).
- Access-token blacklist / a user-facing "revoke all sessions" endpoint (revocation is refresh-side today).
- httpOnly-cookie transport as an alternative to localStorage on the client (would also address XSS token theft; requires CSRF planning).
- Rate limiting / metrics at the gateway level; structured request logging.
- Admin UI: server-side total counts for the user listing (pagination currently uses a full-page heuristic).
- Additional microservice-specific claims or roles may be added.

---

## 7. Notes

- This proposal may be updated as additional requirements are discovered.
- Any changes in domain, claims, roles, or endpoints should update this document accordingly.
