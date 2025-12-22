import pino from "pino";
import pinoHttp, { HttpLogger } from "pino-http";
import { createCorrelationId } from "../../shared/utils";
import { env } from "../../config/env";

export const logger = pino({
  level: env.nodeEnv === "production" ? "info" : "debug",
  timestamp: pino.stdTimeFunctions.isoTime,
  base: undefined
});

export const httpLogger: HttpLogger = pinoHttp({
  logger,
  genReqId: (req): string => {
    const incoming = req.headers["x-request-id"];
    return typeof incoming === "string" ? incoming : createCorrelationId();
  },
  customLogLevel: (_req, res, err): pino.LevelWithSilent => {
    if (err) return "error";
    if (res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  }
});
