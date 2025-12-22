import { emitNotificationToUser } from "../../infra/socket/socket";
import { NotificationDto } from "../../shared/types";
import { NotificationDocument } from "./model";

const toDto = (doc: NotificationDocument): NotificationDto => ({
  id: doc._id?.toHexString() ?? "unknown",
  tenantId: doc.tenantId,
  userId: doc.userId,
  type: doc.type,
  message: doc.message,
  metadata: doc.metadata,
  seen: doc.seen,
  createdAt: doc.createdAt.toISOString()
});

export const emitNotification = (notification: NotificationDocument): void => {
  const dto = toDto(notification);
  emitNotificationToUser(notification.tenantId, notification.userId, dto);
};
