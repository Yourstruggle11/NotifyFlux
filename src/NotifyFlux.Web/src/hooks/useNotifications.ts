import { useCallback, useEffect, useState } from "react";
import { getNotifications, markAllAsSeen as markAllAsSeenApi } from "../api/notificationsApi";
import { Notification } from "../types";
import { useAuth } from "./useAuth";
import { registerNotificationHandlers, unregisterNotificationHandlers } from "../socket/handlers";

type NotificationsState = {
  readonly notifications: ReadonlyArray<Notification>;
  readonly loading: boolean;
  readonly error: string | null;
};

export const useNotifications = (): {
  readonly notifications: ReadonlyArray<Notification>;
  readonly loading: boolean;
  readonly error: string | null;
  readonly markAllAsSeen: () => Promise<void>;
} => {
  const { state } = useAuth();
  const [data, setData] = useState<NotificationsState>({ notifications: [], loading: false, error: null });

  useEffect(() => {
    const tenantId = state.tenantId;
    const token = state.token;

    if (!tenantId || !token) {
      setData({ notifications: [], loading: false, error: null });
      return;
    }

    const load = async (): Promise<void> => {
      setData((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const notifications = await getNotifications(tenantId, token);
        setData({ notifications, loading: false, error: null });
      } catch (error) {
        setData((prev) => ({ ...prev, loading: false, error: (error as Error).message }));
      }
    };

    void load();

    const handleIncoming = (notification: Notification): void => {
      setData((prev) => ({ ...prev, notifications: [notification, ...prev.notifications] }));
    };

    registerNotificationHandlers(handleIncoming);
    return () => unregisterNotificationHandlers(handleIncoming);
  }, [state.token, state.tenantId]);

  const markAllAsSeen = useCallback(async (): Promise<void> => {
    const tenantId = state.tenantId;
    const token = state.token;
    if (!tenantId || !token) {
      return;
    }
    await markAllAsSeenApi(tenantId, token);
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, seen: true }))
    }));
  }, [state.token, state.tenantId]);

  return {
    notifications: data.notifications,
    loading: data.loading,
    error: data.error,
    markAllAsSeen
  };
};
