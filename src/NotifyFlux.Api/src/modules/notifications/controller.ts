import { Response } from "express";
import { createNotification, getUserNotifications, markAllAsSeen } from "./service";
import { AuthenticatedRequest } from "../auth/authenticate";
import { badRequest } from "../../core/errors";
import { parsePagination } from "../../shared/utils";
import { emitSystemEventToTenant } from "../../infra/socket/socket";

export const listNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { tenantId } = req.params;
  if (!tenantId) {
    throw badRequest("tenantId is required");
  }
  const targetUserId = req.auth.roles.includes("admin") && typeof req.query.userId === "string" ? req.query.userId : req.auth.userId;
  const pagination = parsePagination({ limit: req.query.limit?.toString(), skip: req.query.skip?.toString() }, { limit: 20, skip: 0 });
  const notifications = await getUserNotifications(tenantId, targetUserId, pagination);
  res.json({ notifications });
};

export const createNotificationHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { tenantId } = req.params;
  if (!tenantId) {
    throw badRequest("tenantId is required");
  }
  const { userId, type, message, metadata } = req.body as Partial<{ readonly userId: string; readonly type: string; readonly message: string; readonly metadata: Record<string, string | number | boolean | null> }>;

  if (!userId || !type || !message) {
    throw badRequest("userId, type, and message are required");
  }

  const notification = await createNotification({
    tenantId,
    userId,
    type,
    message,
    metadata
  });

  res.status(201).json({ notification });
};

export const markAllAsSeenHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { tenantId } = req.params;
  if (!tenantId) {
    throw badRequest("tenantId is required");
  }
  const updated = await markAllAsSeen(tenantId, req.auth.userId);
  res.json({ updated });
};

export const emitSystemEventHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { tenantId } = req.params;
  if (!tenantId) {
    throw badRequest("tenantId is required");
  }
  const { code, message } = req.body as Partial<{ readonly code: string; readonly message: string }>;
  if (!code || !message) {
    throw badRequest("code and message are required");
  }
  const payload = {
    tenantId,
    code,
    message,
    timestamp: new Date().toISOString()
  };
  emitSystemEventToTenant(tenantId, payload);
  res.status(202).json({ event: payload });
};
