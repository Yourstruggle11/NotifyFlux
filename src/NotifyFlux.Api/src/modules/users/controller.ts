import { Response } from "express";
import { AuthenticatedRequest } from "../auth/authenticate";
import { createUser, findUserByUserId } from "./service";
import { badRequest } from "../../core/errors";
import { Role } from "../../shared/types";

export const createUserHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { tenantId } = req.params;
  if (!tenantId) {
    throw badRequest("tenantId is required");
  }
  const { userId, email, password, roles } = req.body as Partial<{ readonly userId: string; readonly email: string; readonly password: string; readonly roles: string[] }>;

  if (!userId || !email || !password || !roles || roles.length === 0) {
    throw badRequest("userId, email, password, and roles are required");
  }

  const parsedRoles = roles.filter((role): role is Role => role === "admin" || role === "user" || role === "service");

  if (parsedRoles.length === 0) {
    throw badRequest("At least one valid role is required");
  }

  const created = await createUser({
    tenantId,
    userId,
    email,
    password,
    roles: parsedRoles
  });

  res.status(201).json({ user: { ...created, passwordHash: undefined } });
};

export const meHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = await findUserByUserId(req.auth.tenantId, req.auth.userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  const { passwordHash, ...safeUser } = user;
  void passwordHash;
  res.json({ user: safeUser });
};
