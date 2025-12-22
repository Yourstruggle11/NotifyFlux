# Notification Flow

Sequence diagram (markdown):

```
External App -> NotifyFlux API: POST /api/{tenantId}/notifications
NotifyFlux API -> MongoDB: insert notification
MongoDB -> Change Stream Subscriber: new insert event
Change Stream Subscriber -> Socket.IO Adapter: emit notificationReceived
Socket.IO Adapter -> Client Socket: deliver notification (tenant/user room)
Client Socket -> React App: update inbox state
```

Key guarantees:
- Tenant ID is enforced at every hop.
- Emits use Redis-backed adapter so any API node can deliver to connected clients.
- Change stream restart logic ensures transient Mongo interruptions do not drop events.

System event flow (tenant-wide, not persisted):
```
Admin -> NotifyFlux API: POST /api/{tenantId}/notifications/system-event
NotifyFlux API -> Socket.IO Adapter: emit systemEvent
Socket.IO Adapter -> Client Socket: deliver systemEvent (tenant room)
```
