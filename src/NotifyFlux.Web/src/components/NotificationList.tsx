import { Notification } from "../types";

type Props = {
  readonly notifications: ReadonlyArray<Notification>;
};

export const NotificationList = ({ notifications }: Props): JSX.Element => (
  <div className="notification-list">
    {notifications.length === 0 && <p className="muted">No notifications yet.</p>}
    {notifications.map((n) => (
      <div key={n.id} className={`notification ${n.seen ? "seen" : "unseen"}`}>
        <div className="notification-header">
          <span className="notification-type">{n.type}</span>
          <span className="notification-date">{new Date(n.createdAt).toLocaleString()}</span>
        </div>
        <p>{n.message}</p>
        {n.metadata && <pre className="metadata">{JSON.stringify(n.metadata, null, 2)}</pre>}
      </div>
    ))}
  </div>
);
