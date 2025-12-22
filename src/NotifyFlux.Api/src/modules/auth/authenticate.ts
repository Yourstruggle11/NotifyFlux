import { NextFunction, Request, Response } from "express";
import { verifyAuthToken } from "./authService";
import { unauthorized } from "../../core/errors";
import { AuthContext } from "../../shared/types";

declare module "express-serve-static-core" {
  interface Request {
    auth?: AuthContext;
  }
}

export type AuthenticatedRequest = Request & { readonly auth: AuthContext };

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    throw unauthorized("Missing Authorization header");
  }

  const payload = verifyAuthToken(token);
  req.auth = { tenantId: payload.tenantId, userId: payload.userId, roles: payload.roles };
  next();
};
