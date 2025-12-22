import { Notification } from "../types";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const getNotifications = async (tenantId: string, token: string): Promise<Notification[]> => {
  const res = await fetch(`${baseUrl}/api/${tenantId}/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch notifications");
  }

  const data = await res.json() as { readonly notifications: Notification[] };
  return data.notifications;
};

export const markAllAsSeen = async (tenantId: string, token: string): Promise<void> => {
  const res = await fetch(`${baseUrl}/api/${tenantId}/notifications/mark-all-seen`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) {
    throw new Error("Failed to mark notifications");
  }
};

export type CreateNotificationRequest = {
  readonly userId: string;
  readonly type: string;
  readonly message: string;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
};

export const createNotification = async (tenantId: string, token: string, payload: CreateNotificationRequest): Promise<Notification> => {
  const res = await fetch(`${baseUrl}/api/${tenantId}/notifications`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error("Failed to create notification");
  }

  const data = await res.json() as { readonly notification: Notification };
  return data.notification;
};

export const emitSystemEvent = async (tenantId: string, token: string, payload: { readonly code: string; readonly message: string }): Promise<{ readonly code: string; readonly message: string; readonly timestamp: string; readonly tenantId: string }> => {
  const res = await fetch(`${baseUrl}/api/${tenantId}/notifications/system-event`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error("Failed to emit system event");
  }

  const data = await res.json() as { readonly event: { readonly code: string; readonly message: string; readonly timestamp: string; readonly tenantId: string } };
  return data.event;
};
