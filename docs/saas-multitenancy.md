# SaaS Multitenancy

- **Tenant isolation**: Every API route includes `:tenantId` and is validated against the JWT payload. Mongo queries filter by `tenantId` to prevent cross-tenant leakage.
- **Rooms per tenant/user**: Socket.IO rooms isolate emissions. A tenant cannot receive another tenant's events.
- **Service tokens**: Admins issue `service` role JWTs for backend-to-backend integrations. External apps can call `/notifications` to push events to their users without sharing master secrets.
- **Config salt**: `NOTIFYFLUX_TENANT_ID_SALT` can seed deterministic tenant IDs or hashing schemes to avoid collisions.
- **Provisioning**: A lightweight onboarding flow can create tenant-scoped indexes and seed admin users. Hooks exist in code to add per-tenant rate limits or message quotas.
- **Demo seeding**: `POST /api/:tenantId/demo/seed` creates starter users and notifications, making first-run demos consistent across tenants.
