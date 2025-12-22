import { createClient, RedisClientType } from "redis";
import { env } from "../../config/env";
import { logger } from "../logging/logger";

let redisClient: RedisClientType | null = null;

const createBaseClient = (): RedisClientType =>
  createClient({
    socket: {
      host: env.redisHost,
      port: env.redisPort
    },
    password: env.redisPassword || undefined
  });

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (redisClient) {
    return redisClient;
  }

  redisClient = createBaseClient();
  redisClient.on("error", (err) => logger.error({ err }, "Redis client error"));
  await redisClient.connect();
  return redisClient;
};

export const getRedisAdapterClients = async (): Promise<{ readonly pubClient: RedisClientType; readonly subClient: RedisClientType }> => {
  const base = await getRedisClient();
  const pubClient = base.duplicate();
  const subClient = base.duplicate();
  pubClient.on("error", (err) => logger.error({ err }, "Redis pub client error"));
  subClient.on("error", (err) => logger.error({ err }, "Redis sub client error"));
  await Promise.all([pubClient.connect(), subClient.connect()]);
  return { pubClient, subClient };
};

export const closeRedis = async (): Promise<void> => {
  if (!redisClient) {
    return;
  }
  await redisClient.quit();
  redisClient = null;
};
