import {
  rateLimit,
  type IncrementResponse,
  type RateLimitRequestHandler,
  type Store,
  type Options,
} from "express-rate-limit";
import { env } from "../../config/env";
import { getRedisClient } from "../redis/redis";

type RateLimitConfig = {
  readonly limit?: number;
  readonly windowMs?: number;
  readonly keyPrefix?: string;
};

class RedisRateLimitStore implements Store {
  public localKeys = false;
  public prefix: string;
  private windowMs = env.rateLimitWindowMs;

  public constructor(prefix: string) {
    this.prefix = prefix;
  }

  public init(options: Options): void {
    this.windowMs = options.windowMs;
  }

  public async increment(key: string): Promise<IncrementResponse> {
    const client = await getRedisClient();
    const redisKey = this.buildKey(key);
    const totalHits = await client.incr(redisKey);
    if (totalHits === 1) {
      await client.pExpire(redisKey, this.windowMs);
    }
    const ttl = await client.pTTL(redisKey);
    const now = Date.now();
    const resetTime =
      ttl > 0 ? new Date(now + ttl) : new Date(now + this.windowMs);
    return { totalHits, resetTime };
  }

  public async decrement(key: string): Promise<void> {
    const client = await getRedisClient();
    const redisKey = this.buildKey(key);
    const totalHits = await client.decr(redisKey);
    if (totalHits <= 0) {
      await client.del(redisKey);
    }
  }

  public async resetKey(key: string): Promise<void> {
    const client = await getRedisClient();
    await client.del(this.buildKey(key));
  }

  public async get(key: string): Promise<IncrementResponse | undefined> {
    const client = await getRedisClient();
    const redisKey = this.buildKey(key);
    const totalHitsRaw = await client.get(redisKey);
    if (!totalHitsRaw) {
      return undefined;
    }
    const totalHits = Number.parseInt(totalHitsRaw, 10);
    if (Number.isNaN(totalHits)) {
      return undefined;
    }
    const ttl = await client.pTTL(redisKey);
    const resetTime = ttl > 0 ? new Date(Date.now() + ttl) : undefined;
    return { totalHits, resetTime };
  }

  private buildKey(key: string): string {
    return `${this.prefix}:${key}`;
  }
}

export const createRateLimiter = (
  config: RateLimitConfig = {}
): RateLimitRequestHandler => {
  const windowMs = config.windowMs ?? env.rateLimitWindowMs;
  const limit = config.limit ?? env.rateLimitDefaultMax;
  const prefix = config.keyPrefix
    ? `${env.rateLimitKeyPrefix}:${config.keyPrefix}`
    : env.rateLimitKeyPrefix;
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    store: new RedisRateLimitStore(prefix),
  });
};
