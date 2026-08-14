# SecureBank — Digital Banking Application

A complete 3-tier full-stack banking application built for DevOps practice:

- **Frontend:** AngularJS 1.8.3 (ngRoute, ngResource), Bootstrap 5, custom design system
- **Backend:** Node.js + Express REST API
- **Database:** MySQL only (raw SQL via `mysql2`, no ORM)
- **Auth:** JWT, bcrypt password hashing, account lockout, audit logging

No Dockerfiles, Compose files, Kubernetes manifests, or Jenkinsfiles are
included on purpose — this project is meant to be containerized,
pipelined, and deployed by you as DevOps practice.

```
banking-app/
├── frontend/     AngularJS single-page application (static files)
├── backend/      Node.js/Express REST API
└── database/     MySQL schema + seed data
```

---

## 1. Prerequisites

- Node.js 18+ and npm
- MySQL 8.x running locally, in a container, or a hosted instance

## 2. Database setup

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p securebank < database/seed.sql
```

Create an application-specific MySQL user rather than using `root` for the
backend connection, e.g.:

```sql
CREATE USER 'securebank_app'@'%' IDENTIFIED BY 'change_this_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON securebank.* TO 'securebank_app'@'%';
FLUSH PRIVILEGES;
```

Demo credentials created by `seed.sql` (see `database/README.md` for the
full list) — all share the password `Password@123`.

## 3. Backend setup

```bash
cd backend
cp .env.example .env      # edit .env: DB_* credentials, JWT_SECRET, etc.
npm install
npm run dev                # http://localhost:5000 (nodemon, auto-reload)
# or: npm start            # production start
```

Health check: `GET http://localhost:5000/healthz`

## 4. Frontend setup

```bash
cd frontend
npm install                 # also copies AngularJS/Bootstrap into src/vendor
npm start                   # serves src/ at http://localhost:8080
```

The frontend calls the API at the URL defined in
`frontend/src/app/app.config.js` (`API_BASE_URL` constant, default
`http://localhost:5000/api`). Update this for staging/production, or
template it out in your CI/CD pipeline.

---

## 5. REST API reference

All endpoints are prefixed with `/api`. Protected routes require
`Authorization: Bearer <token>`.

| Method | Endpoint                        | Access  | Description                          |
|--------|-----------------------------------|---------|----------------------------------------|
| POST   | `/auth/register`                  | Public  | Register + auto-opens a checking account |
| POST   | `/auth/login`                     | Public  | Authenticate, returns JWT               |
| GET    | `/auth/me`                        | Auth    | Current user profile                    |
| PUT    | `/auth/profile`                     | Auth    | Update name/phone                       |
| PUT    | `/auth/change-password`             | Auth    | Change password                         |
| GET    | `/accounts`                        | Auth    | List the current user's accounts        |
| POST   | `/accounts`                        | Auth    | Open a new account                      |
| GET    | `/accounts/:id`                     | Auth    | Get one account                         |
| GET    | `/transactions/account/:accountId`   | Auth    | Paginated ledger history                |
| POST   | `/transactions/deposit`             | Auth    | Deposit into an account                 |
| POST   | `/transactions/withdraw`            | Auth    | Withdraw from an account                 |
| POST   | `/transfers`                       | Auth    | Transfer money between accounts          |
| GET    | `/transfers`                       | Auth    | List the current user's transfers        |

## 6. How money transfers stay safe

`backend/src/services/transferService.js` wraps every transfer in a single
MySQL transaction:

1. Both the source and destination account rows are locked with
   `SELECT ... FOR UPDATE`, always in ascending account-id order — this
   prevents deadlocks when two transfers between the same pair of accounts
   run concurrently in opposite directions.
2. Balance and status are re-checked *after* locking (not before), so a
   concurrent transfer can't slip in and overdraw the account.
3. The debit, the credit, both ledger rows (`transactions`), and the
   transfer record (`transfers`) all commit together or roll back together.

This is worth reading before you load-test the transfer endpoint — it's
the piece of the app that actually needs to be correct under concurrency.

---

## 7. Environment variables (backend)

See `backend/.env.example`: `NODE_ENV`, `PORT`, `DB_HOST`, `DB_PORT`,
`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_CONNECTION_LIMIT`, `JWT_SECRET`,
`JWT_EXPIRES_IN`, `CORS_ORIGIN`, `RATE_LIMIT_*`, `AUTH_RATE_LIMIT_*`.

---

## 8. Suggested DevOps practice path

1. **Dockerfiles** — one for `backend/` (Node base image, `npm ci`, expose
   port 5000) and one for `frontend/` (multi-stage: `npm install` in a
   Node stage to run `copy-vendor.js`, then copy `src/` into an Nginx
   image). MySQL can run from the official `mysql:8` image, with
   `schema.sql`/`seed.sql` mounted into `/docker-entrypoint-initdb.d/`.
2. **Manual container runs** — run MySQL, backend, and frontend as three
   separate containers on a shared Docker network; verify with `curl`
   before automating anything.
3. **Push to Docker Hub** — tag and push both images.
4. **Jenkins CI/CD** — build → test → push → deploy.
5. **SonarQube** — add static code-quality scanning to the pipeline.
6. **Trivy** — scan both images for vulnerabilities before deploy.
7. **Kubernetes** — Deployments for frontend/backend, a StatefulSet +
   PersistentVolumeClaim for MySQL, Services, an Ingress for the frontend,
   ConfigMaps/Secrets for env vars (never bake `JWT_SECRET` or DB
   credentials into an image), and liveness/readiness probes against
   `/healthz` (backend) and `/` (frontend).
8. **Argo CD** — GitOps deployment once the Kubernetes manifests live in
   a Git repo.
9. **Prometheus + Grafana** — add metrics (consider `prom-client` in the
   backend for custom metrics like transfer volume/latency) and dashboards.

The `/healthz` endpoint on the backend and plain static file serving on
the frontend are both deliberately simple so they're easy to wire into
probes and load balancer health checks.
