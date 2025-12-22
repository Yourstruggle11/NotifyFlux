import { Request, Response } from "express";
import { createAuthToken, verifyPassword } from "./authService";
import { findUserByEmail } from "../users/service";
import { AuthenticatedRequest } from "./authenticate";
import { badRequest, unauthorized } from "../../core/errors";
import { Role } from "../../shared/types";

export const loginHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { tenantId } = req.params;
  if (!tenantId) {
    throw badRequest("tenantId is required");
  }
  const { email, password } = req.body as Partial<{
    readonly email: string;
    readonly password: string;
  }>;

  if (!email || !password) {
    throw badRequest("email and password are required");
  }

  const user = await findUserByEmail(tenantId, email);
  if (!user) {
    throw unauthorized("Invalid credentials");
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw unauthorized("Invalid credentials");
  }

  const token = createAuthToken(user.tenantId, user.userId, user.roles);
  const { passwordHash, ...safeUser } = user;
  res.json({ token, user: safeUser });
};

export const serviceTokenHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { tenantId } = req.params;
  if (!tenantId) {
    throw badRequest("tenantId is required");
  }
  const targetUserId =
    typeof req.body?.userId === "string" ? req.body.userId : req.auth.userId;
  const tokenRoles: ReadonlyArray<Role> = ["service"];
  const token = createAuthToken(tenantId, targetUserId, tokenRoles);
  res.json({ token });
};
