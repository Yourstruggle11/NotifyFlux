import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Notification, SystemEvent } from "../types";
import { registerNotificationHandlers, registerSystemEventHandlers, unregisterNotificationHandlers, unregisterSystemEventHandlers } from "../socket/handlers";

export const RealtimeLogPage = (): JSX.Element => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<ReadonlyArray<Notification>>([]);
  const [events, setEvents] = useState<ReadonlyArray<SystemEvent>>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    const onNotification = (notification: Notification): void => {
      setNotifications((prev) => [notification, ...prev]);
    };
    const onEvent = (event: SystemEvent): void => {
      setEvents((prev) => [event, ...prev]);
    };
    registerNotificationHandlers(onNotification);
    registerSystemEventHandlers(onEvent);
    return () => {
      unregisterNotificationHandlers(onNotification);
      unregisterSystemEventHandlers(onEvent);
    };
  }, [isAuthenticated]);

  return (
    <div className="page realtime-log">
      <h2>Realtime Log</h2>
      <p className="muted small">Notifications arrive on user rooms; System Events are tenant-wide broadcasts (ops, maintenance). Both flow via Socket.IO with Redis adapter.</p>
      <section>
        <h2>Notifications</h2>
        <ul className="log">
          {notifications.map((n) => (
            <li key={`${n.id}-${n.createdAt}`}>
              <strong>{n.type}</strong> {n.message} <em>{new Date(n.createdAt).toLocaleTimeString()}</em>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>System Events</h2>
        <ul className="log">
          {events.map((e) => (
            <li key={`${e.code}-${e.timestamp}`}>
              <strong>{e.code}</strong> {e.message} <em>{new Date(e.timestamp).toLocaleTimeString()}</em>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
