import { NextFunction, Request, Response } from "express";
import { forbidden, unauthorized } from "../../core/errors";
import { Role } from "../../shared/types";

export const authorizeRoles = (...allowed: ReadonlyArray<Role>) => (req: Request, _res: Response, next: NextFunction): void => {
  const auth = req.auth;
  if (!auth) {
    throw unauthorized("Not authenticated");
  }

  if (req.params.tenantId && req.params.tenantId !== auth.tenantId) {
    throw forbidden("Tenant mismatch");
  }

  const hasRole = allowed.some((role) => auth.roles.includes(role));
  if (!hasRole) {
    throw forbidden("Insufficient permissions");
  }

  next();
};
