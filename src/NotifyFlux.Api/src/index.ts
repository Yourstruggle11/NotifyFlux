import { startServer } from "./server/server";
import { logger } from "./infra/logging/logger";

void startServer().catch((error: unknown) => {
  const err = error instanceof Error ? error : new Error("Unknown startup error");
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
