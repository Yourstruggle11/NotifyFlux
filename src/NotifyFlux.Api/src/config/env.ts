import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  MONGO_URI: z.string().min(1).default("mongodb://localhost:27017").refine((val) => val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"), { message: "MONGO_URI must start with mongodb:// or mongodb+srv://" }),
  MONGO_DB_NAME: z.string().min(1).default("notifyflux"),
  REDIS_HOST: z.string().min(1).default("localhost"),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  JWT_SECRET: z.string().min(12),
  SOCKET_IO_CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
  NOTIFYFLUX_TENANT_ID_SALT: z.string().min(1).default("tenant-salt"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development")
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  port: parsed.data.PORT,
  mongoUri: parsed.data.MONGO_URI,
  mongoDbName: parsed.data.MONGO_DB_NAME,
  redisHost: parsed.data.REDIS_HOST,
  redisPort: parsed.data.REDIS_PORT,
  redisPassword: parsed.data.REDIS_PASSWORD ?? "",
  jwtSecret: parsed.data.JWT_SECRET,
  socketCorsOrigin: parsed.data.SOCKET_IO_CORS_ORIGIN,
  tenantIdSalt: parsed.data.NOTIFYFLUX_TENANT_ID_SALT,
  nodeEnv: parsed.data.NODE_ENV
} as const;
