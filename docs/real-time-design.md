# Real-time Design

## Socket.IO
- Namespace: default (`/`).
- Rooms:
  - `tenant:{tenantId}` for tenant-wide broadcasts (system events).
  - `tenant:{tenantId}:user:{userId}` for user-specific notifications.
- Authentication: JWT validated during handshake; connections are rejected on invalid or tenant-mismatched tokens.

## Events
- Server -> Client:
  - `notificationReceived`: `{ id, tenantId, userId, type, message, metadata, seen, createdAt }`
  - `systemEvent`: `{ tenantId, code, message, timestamp }` (not persisted)
- Client -> Server: none required for the demo; future use could include read acknowledgements.

## Emission sources
- **Notifications**: Created via REST, persisted in MongoDB, emitted by the change stream subscriber.
- **System events**: Triggered by admin-only REST endpoint and emitted directly to tenant rooms.

## Reliability
- Socket.IO reconnection enabled by default.
- Change stream is auto-restarted with backoff on transient failures.
- Metrics track connected sockets, notifications emitted, and stream restarts.
