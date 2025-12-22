# Data Model

## Notifications
- Collection: `notifications`
- Shape:
  - `tenantId: string`
  - `userId: string`
  - `type: string`
  - `message: string`
  - `metadata: Record<string, string | number | boolean | null> | undefined`
  - `seen: boolean`
  - `createdAt: Date`
- Indexes:
  - `{ tenantId: 1, userId: 1, seen: 1, createdAt: -1 }` for inbox queries and unseen counts.

## Users
- Collection: `users`
- Shape:
  - `tenantId: string`
  - `userId: string` (external subject identifier)
  - `email: string`
  - `passwordHash: string`
  - `roles: readonly string[]`
  - `createdAt: Date`
- Indexes:
  - `{ tenantId: 1, email: 1 }` unique to prevent duplicates.

## Tenants
- Tenants are implicit through `tenantId` carried in every document and JWT payload. Isolation is enforced at query time and socket room routing.

## System Events
- System events are **not persisted**, they are tenant-wide, real-time broadcasts only.
