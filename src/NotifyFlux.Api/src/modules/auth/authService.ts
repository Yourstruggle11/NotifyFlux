import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../../config/env";
import { AuthTokenPayload } from "./tokenTypes";
import { Role } from "../../shared/types";

const TokenSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  roles: z.array(z.enum(["admin", "user", "service"] as const)),
  iat: z.number(),
  exp: z.number()
});

const TOKEN_TTL_SECONDS = 60 * 60;

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => bcrypt.compare(password, hash);

export const createAuthToken = (tenantId: string, userId: string, roles: ReadonlyArray<Role>): string => {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload: AuthTokenPayload = {
    tenantId,
    userId,
    roles,
    iat: nowSeconds,
    exp: nowSeconds + TOKEN_TTL_SECONDS
  };
  return jwt.sign(payload, env.jwtSecret);
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  const decoded = jwt.verify(token, env.jwtSecret);
  const parsed = TokenSchema.safeParse(decoded);
  if (!parsed.success) {
    throw new Error("Invalid token payload");
  }
  return parsed.data;
};
