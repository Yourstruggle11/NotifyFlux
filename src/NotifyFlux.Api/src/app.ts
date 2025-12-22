import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import { env } from "./config/env";
import { httpLogger } from "./infra/logging/logger";
import notificationsRoutes from "./modules/notifications/routes";
import usersRoutes from "./modules/users/routes";
import authRoutes from "./modules/auth/routes";
import demoRoutes from "./modules/demo/routes";
import { healthHandler, readinessHandler } from "./infra/monitoring/health";
import { metricsHandler } from "./infra/monitoring/metrics";
import { HttpError } from "./core/errors";

export const createApp = (): Application => {
  const app = express();
  app.use(cors({ origin: env.socketCorsOrigin, credentials: true }));
  app.use(express.json());
  app.use(httpLogger);

  app.get("/health", healthHandler);
  app.get("/ready", readinessHandler);
  app.get("/metrics", metricsHandler);

  app.use("/api/:tenantId/notifications", notificationsRoutes);
  app.use("/api/:tenantId/users", usersRoutes);
  app.use("/api/:tenantId/auth", authRoutes);
  app.use("/api/:tenantId/demo", demoRoutes);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const status = err instanceof HttpError ? err.statusCode : 500;
    res.status(status).json({ message: err.message });
  });

  return app;
};
