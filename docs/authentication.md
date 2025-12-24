# Authentication

- **Credential login**: `POST /api/:tenantId/auth/login` accepts `email` and `password`. Passwords are hashed.
- **JWT**: Tokens encode `tenantId`, `userId`, `roles`, `iat`, and `exp`. Secret configured via `JWT_SECRET`.
- **Transport**: Tokens are sent in `Authorization: Bearer` headers for REST and `auth` payload during Socket.IO handshake.
- **Expiry**: Short-lived tokens are advised; refresh tokens can be added later. Token verification fails fast on missing or expired tokens. Currently TTL is 1 hour, and clients must re-authenticate when it expires.
- **Service tokens**: Admins may mint `service` role tokens for server-to-server calls, these are still tenant-scoped.

## JWT strategy (current state and planned evolution)

- **Access token TTL**:
  Access tokens are currently issued with a 1-hour expiry (`exp`) and are validated on every request.
  This TTL is expected to remain short-lived as part of the long-term authentication model.

- **Refresh flow (planned)**:
  A refresh token flow is **planned but not yet implemented**.
  The intended design includes:

  - Short-lived access tokens
  - Rotating refresh tokens stored server-side
  - A dedicated `/auth/refresh` endpoint
  - Ability to revoke refresh tokens on logout or compromise
    This will allow token renewal without re-authentication while preserving strong security guarantees.

- **Signing key rotation (planned)**:
  JWT signing key rotation is **planned but not yet implemented**.
  The planned approach includes:

  - Support for multiple active signing keys
  - Use of the `kid` header to identify keys
  - Periodic secret rotation with overlap to avoid token invalidation during rollout

---

## CORS and session behavior

- **CORS behavior**:
  The API currently allows CORS from the origin defined in `SOCKET_IO_CORS_ORIGIN` and enables `credentials: true` for both REST and Socket.IO.
  This configuration is expected to remain the baseline as the platform evolves.

- **Session model**:
  Authentication is fully stateless and based on JWTs:

  - REST requests use `Authorization: Bearer <JWT>` headers
  - Socket.IO connections authenticate via the auth payload
    No cookies or server-side sessions are used today, and the system is designed to remain stateless as additional auth features (refresh tokens, key rotation) are introduced.

## Demo seeding

- Admins can call `POST /api/:tenantId/demo/seed` to create sample users and notifications for a first-run demo.
