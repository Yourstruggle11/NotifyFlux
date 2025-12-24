import { Request, Response } from "express";
import { createAuthToken, verifyPassword } from "./authService";
import { findUserByEmail } from "../users/service";
import { AuthContext } from "../../shared/types";
import { badRequest, unauthorized } from "../../core/errors";
import { Role } from "../../shared/types";

type LoginBody = {
  readonly email?: string;
  readonly password?: string;
};

type ServiceTokenBody = {
  readonly userId?: string;
};

type ServiceTokenRequest = Request<{ tenantId: string }, unknown, ServiceTokenBody> & {
  readonly auth: AuthContext;
};

export const loginHandler = async (
  req: Request<Record<string, string | undefined>, unknown, LoginBody>,
  res: Response
): Promise<void> => {
  const { tenantId } = req.params;
  if (!tenantId) {
    throw badRequest("tenantId is required");
  }
  const { email, password } = req.body;

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
  void passwordHash;
  res.json({ token, user: safeUser });
};

export const serviceTokenHandler = async (
  req: ServiceTokenRequest,
  res: Response
): Promise<void> => {
  const { tenantId } = req.params;
  if (!tenantId) {
    throw badRequest("tenantId is required");
  }
  const targetUserId = req.body.userId ?? req.auth.userId;
  const tokenRoles: ReadonlyArray<Role> = ["service"];
  const token = createAuthToken(tenantId, targetUserId, tokenRoles);
  res.json({ token });
};
