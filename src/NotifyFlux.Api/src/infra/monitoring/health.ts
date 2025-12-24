import { Request, Response } from "express";
import { connectMongo } from "../db/mongo";
import { getRedisClient } from "../redis/redis";

export const healthHandler = (_req: Request, res: Response): void => {
  res.json({ status: "ok" });
};

export const readinessHandler = async (_req: Request, res: Response): Promise<void> => {
  try {
    const db = await connectMongo();
    await db.command({ ping: 1 });
    const redis = await getRedisClient();
    await redis.ping();
    res.json({ status: "ready" });
  } catch (error) {
    res.status(503).json({ status: "degraded", error: (error as Error).message });
  }
};
