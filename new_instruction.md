ROLE
You are a senior full-stack engineer. Project: Taskigo (Express + React + Firebase + Firestore + Firebase Storage + Neon/Postgres).
You write production-grade, secure TypeScript with structured logs and clear tests.

GOAL
Add request-scoped, PII-safe logging that is visible in the **terminal during `npm run dev`** (stdout JSON), plus:
- A Neon `audit_log` trail for key business events.
- Optional NDJSON batch export to Firebase Storage for forensics.
Tighten provider approval logs and claims refresh.
Then implement the pending features listed below.

CONTEXT
- Auth, roles, admin panel, provider application/approval flow exist and work.
- Basic logging exists but is inconsistent and not request-scoped.
- Dev runs with `npm run dev` (Vite/Express); logs must print to the **terminal** and (in dev) also tee to a file.

REQUIREMENTS (OUTPUT CONTRACT)
Logging (must show in terminal during `npm run dev`)
- Create `requestId` middleware: set `(req as any).requestId`, return `X-Request-Id` header.
- Create `log(level, msg, extra)` util:
  - Writes **one-line JSON** to **stdout** (visible in terminal).
  - In dev, **also** append to `logs-dev.ndjson` (rotating daily).
- Redact sensitive keys (`password`, `token`, `authorization`, `cookie`) in all logs.
- Access log per request with `{requestId, method, path, status, durationMs, user.uid/email?}`.
- Add 404 handler before global error handler → respond `{error:"Not found"}` and log `route_not_found`.
- Global error handler: in dev include `stack`, in prod hide stack; always log `{requestId, name, message}`.

Neon audit trail (low-volume, queryable)
- Create table:
CREATE TABLE IF NOT EXISTS audit_log (
id BIGSERIAL PRIMARY KEY,
at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
request_id TEXT,
actor_uid TEXT,
actor_email TEXT,
action TEXT NOT NULL, -- 'provider.apply','provider.approve','service.create'
target_uid TEXT,
target_id TEXT,
result_code TEXT, -- 'ok'|'fail'|'already_provider'
details JSONB
);

markdown
Copy code
- Insert 1 row per critical event (apply/approve/reject/service create, login success/fail summary). Keep `details` small.

Firebase Storage NDJSON export (forensics)
- Implement `ndjsonExport` buffer:
- Batch lines and **optionally** gzip-upload to `logs/YYYY-MM-DD/app-YYYYMMDD-HH.ndjson.gz`.
- Controlled by `LOG_EXPORT_ENABLED=true`.
- Flush on `uncaughtException`/`unhandledRejection` (before exit) and on an admin endpoint `/admin/logs/flush` (admin-gated).
- Do **not** enable continuous export in prod unless investigating.

Client logging (dev only)
- Gate client console logs with `VITE_DEBUG=true`.
- Log auth role transitions (`prevRole -> nextRole`), redirect guards, API outcomes with `requestId` from response header.
- On responses with `X-Action: claims-updated`, immediately call `getIdToken(true)` and re-route.

Security & Ops
- Rate-limit `/apply` and auth endpoints; log rejections at `warn`.
- CORS allowlist; log denied origins at `warn`.
- Helmet + CSP (report-only first); log CSP violations.
- Add `/healthz` (cheap) and `/readyz` (checks Firebase Admin + Neon). Log failures.

FILES TO CREATE / EDIT
- `server/middleware/requestId.ts` (NEW): sets requestId and header.
- `server/middleware/log.ts` (NEW): `log()` util + redaction + dev file append (stdout always).
- `server/middleware/errorHandler.ts` (UPDATE): 404 + global error handler.
- `server/middleware/ndjsonExport.ts` (NEW): buffer + gzip + Storage upload + `flush()`.
- `server/middleware/audit.ts` (NEW): `audit(action, fields)` helper (writes Neon row).
- `server/index.ts` (UPDATE): wire order = requestId → access log → routes → 404 → errorHandler; add process crash handlers that call `flush()`.
- `server/routes/admin.ts` (UPDATE): instrument approve/reject: step logs (`claim_set`, `db_update`, `notify`) + audit rows; set `X-Action: claims-updated` on success.
- `server/routes/providers.ts` (UPDATE): `/apply` logs payload **shape** (counts/sizes only) + audit row.
- `client/src/hooks/useAuth.ts` (UPDATE): claims refresh when `X-Action: claims-updated`; debug logs when `VITE_DEBUG`.
- `client/src/lib/api.ts` (UPDATE): attach `Authorization`; capture and expose `X-Request-Id`.
- `.env.sample` (UPDATE): add `LOG_EXPORT_ENABLED`.

NEXT FEATURES TO IMPLEMENT (from product to-dos)
1) **Env sanity**
 - Validate at boot: `DATABASE_URL, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (quoted with \n), FIREBASE_STORAGE_BUCKET, JWT_SECRET, ADMIN_EMAIL`.
 - On missing/invalid, log `level=error` and fail fast.

2) **Role propagation on approval**
 - In approve endpoint: set Firebase **custom claim** `{ provider: true }`, mirror DB role, return header `X-Action: claims-updated: true`.
 - Client: on that header, `await getIdToken(true)` then route to `/dashboard/services`.
 - Log each step with `result_code` and write an `audit_log` row.

3) **Notifications on decision**
 - After approve/reject, create a notification in your storage layer.
 - `/api/notifications` should include unread counts; mark-as-read endpoint returns updated count.
 - Log `notifications.emit.ok|fail` and audit (`provider.approve.notify`).

4) **Provider services management**
 - Add provider “Create Service” page (title, desc, price, images).
 - Admin can also create services (shared form or admin-only tab).
 - Protect server routes with `requireProvider` / `requireAdmin`.
 - Save images to Firebase Storage; store URLs + metadata in Neon.
 - Log and audit `service.create|update|delete`.

5) **End-to-end checks (automatable)**
 - Login (Google + email/pw) → logs `auth.login.ok|fail`.
 - Apply as provider → `/pending-approval` redirect; audit `provider.apply`.
 - Admin approves → applicant gets notification; client claims refresh; redirect to `/dashboard/services`.
 - Header shows “Become a Provider” **only** for non-providers.
 - Oversized upload → Storage rules deny → client toast; server logs `rules_denied`.

CODE STYLE
- TypeScript strict; no `any`.
- All server logs use `log(level, msg, extra)` → **stdout** (visible in terminal) and (dev) append to `logs-dev.ndjson`.
- Redact secrets always.
- Keep audit rows compact.

ACCEPTANCE CRITERIA
- Running `npm run dev` prints structured JSON lines for access logs, admin actions, errors (all visible in the terminal).
- Approve flow emits: `admin.approve.start` → `claim_set.ok` → `db_update.ok` → `notify.ok` → `admin.approve.end` (same `requestId`), **and** one `audit_log` row.
- 404 returns `{error:"Not found"}` and logs `route_not_found` with `requestId`.
- Crash triggers `ndjsonExport.flush()` and uploads a gzipped file to `logs/YYYY-MM-DD/app-YYYYMMDD-HH.ndjson.gz` (when `LOG_EXPORT_ENABLED=true`).
- Client refreshes claims when `X-Action: claims-updated` and re-routes to `/dashboard/services`.
- With `VITE_DEBUG=true`, client console shows role transitions and API outcomes; otherwise it’s quiet.

ENV VARS
Server: `DATABASE_URL, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET, JWT_SECRET, ADMIN_EMAIL, LOG_EXPORT_ENABLED`
Client: `VITE_FIREBASE_*, VITE_DEBUG`

DELIVERABLE FORMAT
- Code blocks per file (full contents or diffs).
- 1–2 line “why” note per file.
- Final “Run & verify” checklist with curl examples.

DO NOT
- Do not log raw request bodies, tokens, cookies, or images.
- Do not enable NDJSON export in prod unless investigating.
- Do not change env names without calling it out.