# SaaS Integration Guide

NotifyFlux exposes a tenant-scoped notification service that external systems can consume via REST (Socket.IO is optional for service clients).

## Auth model
- JWTs encode `tenantId`, `userId`, and `roles` (`admin`, `user`, `service`).
- External backends should request a **service token** (admin-only) via `POST /api/:tenantId/auth/service-token`; the token is restricted to that tenant and role.
- Clients use `Authorization: Bearer <token>` for REST and pass the token in the Socket.IO `auth` payload.

## Typical flows
1. **Provision tenant**: create at least one admin for the tenant.
2. **Issue service token**: admin calls `/auth/service-token` to obtain a token for their backend.
3. **Publish notifications**: external service calls `POST /api/:tenantId/notifications` with the service token to fan out messages to users; data is tenant-scoped.
4. **Clients subscribe**: frontends connect to Socket.IO with user tokens; they receive `notificationReceived` for their user room and `systemEvent` for tenant-wide events.
5. **Acknowledge/read**: clients call `POST /api/:tenantId/notifications/mark-all-seen` or refetch inbox via `GET /api/:tenantId/notifications`.

## Example requests
```bash
# Login (admin)
curl -X POST http://localhost:4000/api/demo-tenant/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"changeme"}'

# Issue service token
curl -X POST http://localhost:4000/api/demo-tenant/auth/service-token \
  -H "Authorization: Bearer ADMIN_JWT"

# Create notification with service token
curl -X POST http://localhost:4000/api/demo-tenant/notifications \
  -H "Authorization: Bearer SERVICE_JWT" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user1","type":"demo","message":"Hello!","metadata":{"source":"docs"}}'

# Tenant-wide system event (admin only)
curl -X POST http://localhost:4000/api/demo-tenant/notifications/system-event \
  -H "Authorization: Bearer ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"code":"ops/maintenance","message":"Planned maintenance"}'
```

## Socket.IO contract
- `notificationReceived`: user-specific notifications.
- `systemEvent`: tenant-wide operational messages.
- Rooms:
  - `tenant:{tenantId}:user:{userId}` (user-scoped)
  - `tenant:{tenantId}` (tenant-scoped)

## Multi-tenant safety
- All routes require `:tenantId` path param matching the JWT `tenantId`.
- Service tokens cannot cross tenants.
- Mongo queries and Socket.IO rooms always include `tenantId`.
