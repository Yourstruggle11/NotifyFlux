# NotifyFlux

NotifyFlux is a production-grade, multi-tenant SaaS notification platform that delivers low-latency, real-time events at scale. It combines an Express/Socket.IO backend with MongoDB change streams, Redis-backed fanout, and a Vite + React frontend for operational visibility.

## Packages

- `src/NotifyFlux.Api`: Node.js + TypeScript API server with Socket.IO, MongoDB, Redis, JWT auth, and multi-tenant semantics.
- `src/NotifyFlux.Web`: React + TypeScript SPA consuming the API and listening to real-time events.

## Quickstart

1. Copy `.env.example` files in the root and in each package to `.env` and adjust values.
2. Run `npm install` at the repo root to install workspace dependencies.
3. Start the stack via Docker Compose:
   - `docker compose up -d` (MongoDB, Redis, API, Web served via Nginx).
   - Mongo runs as a single-node replica set in Docker Compose to support change streams.
4. For local dev without Docker Compose:
   - `npm run dev:api`
   - `npm run dev:web`

### Seed demo data
- Backend script: `npm --workspace src/NotifyFlux.Api run seed` (uses `SEED_TENANT_ID` or defaults to `demo-tenant`).
- Frontend: Admin Console -> "Seed Demo Data" button seeds sample users and notifications.
  - Demo seeding is disabled when `NODE_ENV=production`.

## Architecture Highlights

- **Real-time pipeline**: MongoDB change streams -> Socket.IO adapter (Redis) -> clients. Tenants and users are mapped to dedicated rooms to preserve isolation.
- **Multi-tenancy**: Every document and request is scoped by `tenantId`; JWTs encode tenant and roles.
- **Observability**: Structured logging, health/readiness probes, and a Prometheus-compatible `/metrics` endpoint (Prometheus not bundled).
- **Reliability**: Graceful shutdown, retrying Mongo connection and change streams, Redis-backed Socket.IO for horizontal scale.
- **Frontend delivery**: Web UI is built by Vite and served by Nginx in Docker (SPA routing via `try_files`).

![NotifyFlux Architecture](docs/assets/notifyflux-architecture.png)

See `docs/` for deeper design notes on scaling, data models, and SaaS integration patterns.

## Documentation

Start at `docs/README.md` for the full index and links to architecture, API usage, and SaaS integration.
