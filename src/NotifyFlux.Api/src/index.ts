import { startServer } from "./server/server";
import { logger } from "./infra/logging/logger";

void startServer().catch((error) => {
  logger.error({ error }, "Failed to start server");
  process.exit(1);
});
