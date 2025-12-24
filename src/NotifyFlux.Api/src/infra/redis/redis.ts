import { createClient, RedisClientType, RedisFunctions, RedisModules, RedisScripts } from "redis";
import { env } from "../../config/env";
import { logger } from "../logging/logger";

type RedisClient = RedisClientType<RedisModules, RedisFunctions, RedisScripts>;

let redisClient: RedisClient | null = null;

const createBaseClient = (): RedisClient =>
  createClient<RedisModules, RedisFunctions, RedisScripts>({
    socket: {
      host: env.redisHost,
      port: env.redisPort
    },
    password: env.redisPassword || undefined
  });

export const getRedisClient = async (): Promise<RedisClient> => {
  if (redisClient) {
    return redisClient;
  }

  redisClient = createBaseClient();
  redisClient.on("error", (err) => {
    const error = err instanceof Error ? err : new Error("Redis client error");
    logger.error({ err: error }, "Redis client error");
  });
  await redisClient.connect();
  return redisClient;
};

export const getRedisAdapterClients = async (): Promise<{ readonly pubClient: RedisClient; readonly subClient: RedisClient }> => {
  const base = await getRedisClient();
  const pubClient = base.duplicate();
  const subClient = base.duplicate();
  pubClient.on("error", (err) => {
    const error = err instanceof Error ? err : new Error("Redis pub client error");
    logger.error({ err: error }, "Redis pub client error");
  });
  subClient.on("error", (err) => {
    const error = err instanceof Error ? err : new Error("Redis sub client error");
    logger.error({ err: error }, "Redis sub client error");
  });
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
