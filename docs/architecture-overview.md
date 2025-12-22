# Architecture Overview

NotifyFlux is a multi-tenant notification platform designed for high-throughput, low-latency event delivery. It is composed of:

- **API Gateway**: Express + Socket.IO server providing REST and WebSocket interfaces. Stateless instances sit behind an optional load balancer in production.
- **Real-time Bus**: Socket.IO server with Redis adapter for horizontal fanout across many API nodes.
- **Data Layer**: MongoDB stores notifications and users; change streams mirror new inserts to the real-time bus.
- **Caching/Broker**: Redis powers the Socket.IO adapter and future rate-limiting or job buffering.
- **Frontend**: Vite + React SPA for inbox, login, and real-time debugging views; served by Nginx in Docker.
- **Observability**: Pino logging, health/readiness endpoints, and a Prometheus-compatible `/metrics` endpoint (scraper not bundled).

### Data Flow
1. External app calls NotifyFlux REST to create a notification scoped by `tenantId`.
2. Notification is persisted in MongoDB.
3. MongoDB change stream picks up the insert and emits via Socket.IO to rooms derived from tenant and user IDs.
4. React clients subscribed to those rooms receive `notificationReceived` and update UI in real time.

![NotifyFlux Architecture](assets/notifyflux-architecture.png)
