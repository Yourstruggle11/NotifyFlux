# Authentication

- **Credential login**: `POST /api/:tenantId/auth/login` accepts `email` and `password`. Passwords are hashed.
- **JWT**: Tokens encode `tenantId`, `userId`, `roles`, `iat`, and `exp`. Secret configured via `JWT_SECRET`.
- **Transport**: Tokens are sent in `Authorization: Bearer` headers for REST and `auth` payload during Socket.IO handshake.
- **Expiry**: Short-lived tokens are advised; refresh tokens can be added later. Token verification fails fast on missing or expired tokens. Currently TTL is 1 hour.
- **Service tokens**: Admins may mint `service` role tokens for server-to-server calls, these are still tenant-scoped.

## Demo seeding
- Admins can call `POST /api/:tenantId/demo/seed` to create sample users and notifications for a first-run demo.
