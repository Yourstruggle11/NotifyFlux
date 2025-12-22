import { Notification, SystemEvent } from "../types";
import { getSocket } from "./connection";

type NotificationHandler = (notification: Notification) => void;
type SystemEventHandler = (event: SystemEvent) => void;

const notificationHandlers = new Set<NotificationHandler>();
const systemEventHandlers = new Set<SystemEventHandler>();

const bindIfSocketPresent = (): void => {
  const socket = getSocket();
  if (!socket) {
    return;
  }
  socket.off("notificationReceived");
  socket.off("systemEvent");
  socket.on("notificationReceived", (notification) => {
    notificationHandlers.forEach((handler) => handler(notification));
  });
  socket.on("systemEvent", (event) => {
    systemEventHandlers.forEach((handler) => handler(event));
  });
};

export const registerNotificationHandlers = (handler: NotificationHandler): void => {
  notificationHandlers.add(handler);
  bindIfSocketPresent();
};

export const unregisterNotificationHandlers = (handler: NotificationHandler): void => {
  notificationHandlers.delete(handler);
};

export const registerSystemEventHandlers = (handler: SystemEventHandler): void => {
  systemEventHandlers.add(handler);
  bindIfSocketPresent();
};

export const unregisterSystemEventHandlers = (handler: SystemEventHandler): void => {
  systemEventHandlers.delete(handler);
};
