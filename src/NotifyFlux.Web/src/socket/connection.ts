import { io, Socket } from "socket.io-client";
import { Notification, SystemEvent } from "../types";

type ServerToClientEvents = {
  readonly notificationReceived: (notification: Notification) => void;
  readonly systemEvent: (event: SystemEvent) => void;
};

type ClientToServerEvents = Record<string, never>;

export type NotifyFluxSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: NotifyFluxSocket | null = null;

export const connectSocket = (token: string): NotifyFluxSocket => {
  if (socket) {
    socket.disconnect();
  }
  socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: { token },
    autoConnect: true,
    reconnection: true
  });
  return socket;
};

export const getSocket = (): NotifyFluxSocket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
