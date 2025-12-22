import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { env } from "../../config/env";
import { getRedisAdapterClients } from "../redis/redis";
import { verifyAuthToken } from "../../modules/auth/authService";
import { NotificationDto, SystemEventDto, Role } from "../../shared/types";
import { logger } from "../logging/logger";
import { incrementConnectedSockets, decrementConnectedSockets, incrementNotificationsEmitted, incrementSystemEvents } from "../monitoring/metrics";

type SocketAuthData = {
  readonly tenantId: string;
  readonly userId: string;
  readonly roles: ReadonlyArray<Role>;
};

type AuthedSocket = Socket & { readonly data: Socket["data"] & { auth?: SocketAuthData } };

let io: Server | null = null;

const userRoom = (tenantId: string, userId: string): string => `tenant:${tenantId}:user:${userId}`;
const tenantRoom = (tenantId: string): string => `tenant:${tenantId}`;

export const initSocketServer = async (httpServer: HttpServer): Promise<Server> => {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: env.socketCorsOrigin,
      methods: ["GET", "POST"]
    }
  });

  const { pubClient, subClient } = await getRedisAdapterClients();
  io.adapter(createAdapter(pubClient, subClient));

  io.use((socket, next) => {
    const rawToken = typeof socket.handshake.auth?.token === "string"
      ? socket.handshake.auth.token
      : typeof socket.handshake.query.token === "string"
        ? socket.handshake.query.token
        : null;

    if (!rawToken) {
      return next(new Error("Unauthorized"));
    }

    try {
      const payload = verifyAuthToken(rawToken);
      const authData: SocketAuthData = {
        tenantId: payload.tenantId,
        userId: payload.userId,
        roles: payload.roles
      };
      (socket as AuthedSocket).data.auth = authData;
      socket.join([userRoom(payload.tenantId, payload.userId), tenantRoom(payload.tenantId)]);
      return next();
    } catch (error) {
      return next(error as Error);
    }
  });

  io.on("connection", (socket: AuthedSocket) => {
    const auth = socket.data.auth;
    incrementConnectedSockets();
    logger.info({ socketId: socket.id, auth }, "Socket connected");

    socket.on("disconnect", (reason) => {
      decrementConnectedSockets();
      logger.info({ socketId: socket.id, reason }, "Socket disconnected");
    });
  });

  return io;
};

const getSocketServer = (): Server => {
  if (!io) {
    throw new Error("Socket server not initialized");
  }
  return io;
};

export const emitNotificationToUser = (tenantId: string, userId: string, notification: NotificationDto): void => {
  const server = getSocketServer();
  server.to(userRoom(tenantId, userId)).emit("notificationReceived", notification);
  incrementNotificationsEmitted();
};

export const emitSystemEventToTenant = (tenantId: string, event: SystemEventDto): void => {
  const server = getSocketServer();
  server.to(tenantRoom(tenantId)).emit("systemEvent", event);
  incrementSystemEvents();
};

export const closeSocketServer = async (): Promise<void> => {
  if (!io) {
    return;
  }
  await io.close();
  io = null;
};
