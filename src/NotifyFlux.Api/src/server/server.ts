import { createServer, Server as HttpServer } from "http";
import { createApp } from "../app";
import { env } from "../config/env";
import { logger } from "../infra/logging/logger";
import { connectMongo, closeMongo } from "../infra/db/mongo";
import { getRedisClient, closeRedis } from "../infra/redis/redis";
import { initSocketServer, closeSocketServer } from "../infra/socket/socket";
import { startNotificationChangeStream } from "../modules/notifications/changeStreamSubscriber";

let httpServer: HttpServer | null = null;

const registerShutdown = (): void => {
  const shutdown = async (): Promise<void> => {
    logger.info("Graceful shutdown initiated");
    if (httpServer) {
      httpServer.close();
    }
    await closeSocketServer();
    await closeMongo();
    await closeRedis();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
};

export const startServer = async (): Promise<void> => {
  await connectMongo();
  await getRedisClient();
  const app = createApp();
  httpServer = createServer(app);
  await initSocketServer(httpServer);

  registerShutdown();

  httpServer.listen(env.port, () => {
    logger.info({ port: env.port }, "HTTP server listening");
  });

  void startNotificationChangeStream();
};
