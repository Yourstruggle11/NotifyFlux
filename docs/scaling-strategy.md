# Scaling Strategy

- **Stateless API nodes**: All runtime state is externalized. Sessions are JWT-based; sockets authenticate on connect. Deploy behind a load balancer in production.
- **Redis-backed Socket.IO adapter**: Ensures fanout across many API instances. Each node can emit to any tenant/user room.
- **MongoDB change streams**: Each node may run a subscriber; idempotent emits make duplicate events safe. Alternatively, a leader election strategy can be layered on later.
- **Horizontal pods**: API containers scale out; MongoDB and Redis can be clustered as workloads grow.
- **Backpressure**: API endpoints are lightweight; comments in code show where to add queues/rate limiting if spikes exceed direct fanout capacity.
- **Sharding**: MongoDB indexes on `(tenantId, userId, seen, createdAt)` keep read-heavy queries efficient. Tenants can be sharded or isolated into separate clusters if required.
