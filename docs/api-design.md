# API Design

Base path (tenant-scoped): `/api/:tenantId`

## Auth
- `POST /api/:tenantId/auth/login` -> `{ token, user }`
- `POST /api/:tenantId/auth/service-token` (admin) -> `{ token }`

## Users
- `POST /api/:tenantId/users` (admin) -> create user with roles.
- `GET /api/:tenantId/users/me` -> current profile.

## Notifications
- `GET /api/:tenantId/notifications?skip=0&limit=20` -> list current user's notifications.
- `POST /api/:tenantId/notifications` (admin|service) -> create notification for a user.
- `POST /api/:tenantId/notifications/mark-all-seen` -> mark current user's notifications as seen.
- `POST /api/:tenantId/notifications/system-event` (admin) -> broadcast tenant-wide system event (not persisted).

## Demo / Bootstrap
- `POST /api/:tenantId/demo/seed` (admin, non-production) -> seed sample users and notifications for quick evaluation.

## Infra endpoints (not tenant-scoped)
- `GET /health` -> liveness check.
- `GET /ready` -> readiness check (Mongo + Redis).
- `GET /metrics` -> Prometheus-compatible metrics endpoint.

## Notes
- All tenant endpoints require `Authorization: Bearer <JWT>`.
- Tenancy is enforced by matching the path `tenantId` to the JWT `tenantId`.
- Versioning can be introduced via `/v1/api/:tenantId/...` if needed.
- Auth endpoints are rate-limited to reduce brute-force attempts.

## Example requests
```bash
# Login (admin)
curl -X POST http://localhost:4000/api/demo-tenant/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"changeme"}'

# Create a notification
curl -X POST http://localhost:4000/api/demo-tenant/notifications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user1","type":"demo","message":"Hello from docs","metadata":{"source":"api-design"}}'

# Mark all seen
curl -X POST http://localhost:4000/api/demo-tenant/notifications/mark-all-seen \
  -H "Authorization: Bearer $TOKEN"

# System event (tenant-wide)
curl -X POST http://localhost:4000/api/demo-tenant/notifications/system-event \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"ops/maintenance","message":"Planned maintenance at 02:00 UTC"}'

# Seed demo data
curl -X POST http://localhost:4000/api/demo-tenant/demo/seed \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Health / readiness / metrics
curl http://localhost:4000/health
curl http://localhost:4000/ready
curl http://localhost:4000/metrics
```
