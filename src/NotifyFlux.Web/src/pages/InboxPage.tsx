import { NotificationList } from "../components/NotificationList";
import { NotificationBadge } from "../components/NotificationBadge";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../hooks/useAuth";
import { createNotification } from "../api/notificationsApi";
import { useState, FormEvent } from "react";

export const InboxPage = (): JSX.Element => {
  const { notifications, loading, error, markAllAsSeen } = useNotifications();
  const { state } = useAuth();
  const [createError, setCreateError] = useState<string | null>(null);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [form, setForm] = useState<{ readonly userId: string; readonly type: string; readonly message: string; readonly metadata: string }>({
    userId: "",
    type: "demo",
    message: "",
    metadata: ""
  });

  const unseenCount = notifications.filter((n) => !n.seen).length;

  const onCreateNotification = async (evt: FormEvent): Promise<void> => {
    evt.preventDefault();
    setCreateError(null);
    setCreateMessage(null);
    if (!state.tenantId || !state.token) {
      setCreateError("Not authenticated");
      return;
    }

    try {
      const targetUserId = form.userId.trim();
      if (!targetUserId) {
        setCreateError("Target user id is required");
        return;
      }
      const metadata = form.metadata ? JSON.parse(form.metadata) as Record<string, string | number | boolean | null> : undefined;
      await createNotification(state.tenantId, state.token, {
        userId: targetUserId,
        type: form.type,
        message: form.message,
        metadata
      });
      setCreateMessage("Notification created and will emit via Socket.IO.");
      setForm({ ...form, message: "" });
    } catch (err) {
      setCreateError((err as Error).message);
    }
  };

  return (
    <div className="page inbox">
      <div className="grid two">
        <div className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Live inbox</p>
              <h2>Your notifications</h2>
            </div>
            <NotificationBadge count={unseenCount} />
          </div>
          {loading && <p>Loading...</p>}
          {error && <p className="error">{error}</p>}
          <NotificationList notifications={notifications} />
          <div className="actions">
            <button type="button" onClick={() => void markAllAsSeen()}>Mark all seen</button>
          </div>
        </div>
        {(state.roles?.includes("admin") || state.roles?.includes("service")) && (
          <div className="card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Admin/Service</p>
                <h2>Create Notification</h2>
              </div>
            </div>
            <form onSubmit={onCreateNotification} className="stack">
            <label>
              Target User ID
              <input
                value={form.userId}
                placeholder={state.userId ?? "user-id"}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                required
              />
            </label>
              <label>
                Type
                <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required />
              </label>
              <label>
                Message
                <input value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
              </label>
              <label>
                Metadata (JSON)
                <textarea value={form.metadata} onChange={(e) => setForm({ ...form, metadata: e.target.value })} placeholder='{"foo":"bar"}' />
              </label>
              <button type="submit">Send Notification</button>
              {createError && <p className="error">{createError}</p>}
              {createMessage && <p className="success">{createMessage}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
