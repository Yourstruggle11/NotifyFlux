import { Response } from "express";
import { AuthenticatedRequest } from "../auth/authenticate";
import { badRequest, forbidden } from "../../core/errors";
import { runSeed } from "./service";
import { env } from "../../config/env";

export const seedDemoHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (env.nodeEnv === "production") {
    throw forbidden("Demo seeding is disabled in production");
  }
  const { tenantId } = req.params;
  if (!tenantId) {
    throw badRequest("tenantId is required");
  }
  const result = await runSeed(tenantId);
  res.status(201).json({ seeded: result });
};
