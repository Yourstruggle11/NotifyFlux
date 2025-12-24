import { Server as HttpServer } from "http";
import { Server, Socket, DefaultEventsMap } from "socket.io";
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

type SocketData = { auth?: SocketAuthData };
type NotifyServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;
type AuthedSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;

let io: NotifyServer | null = null;

const userRoom = (tenantId: string, userId: string): string => `tenant:${tenantId}:user:${userId}`;
const tenantRoom = (tenantId: string): string => `tenant:${tenantId}`;

const readToken = (input: unknown): string | null => {
  if (typeof input !== "object" || input === null) {
    return null;
  }
  const token = (input as Record<string, unknown>).token;
  return typeof token === "string" ? token : null;
};

export const initSocketServer = async (httpServer: HttpServer): Promise<NotifyServer> => {
  if (io) {
    return io;
  }

  io = new Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>(httpServer, {
    cors: {
      origin: env.socketCorsOrigin,
      methods: ["GET", "POST"]
    }
  });

  const { pubClient, subClient } = await getRedisAdapterClients();
  io.adapter(createAdapter(pubClient, subClient));

  const extractToken = (socket: AuthedSocket): string | null => {
    const rawAuth = socket.handshake.auth as unknown;
    const rawQuery = socket.handshake.query as unknown;
    const fromAuth = readToken(rawAuth);
    if (fromAuth) {
      return fromAuth;
    }
    return readToken(rawQuery);
  };

  io.use((socket, next) => {
    const rawToken = extractToken(socket);

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
      socket.data.auth = authData;
      socket.join([userRoom(payload.tenantId, payload.userId), tenantRoom(payload.tenantId)]);
      return next();
    } catch (error) {
      return next(error as Error);
    }
  });

  io.on("connection", (socket) => {
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

const getSocketServer = (): NotifyServer => {
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
