import { InsertOneResult } from "mongodb";
import { getNotificationsCollection } from "../../infra/db/mongo";
import { NotificationDocument, CreateNotificationInput } from "./model";

export const createNotification = async (input: CreateNotificationInput): Promise<NotificationDocument> => {
  const collection = getNotificationsCollection();
  const doc: NotificationDocument = {
    tenantId: input.tenantId,
    userId: input.userId,
    type: input.type,
    message: input.message,
    metadata: input.metadata,
    seen: false,
    createdAt: new Date()
  };
  const result: InsertOneResult<NotificationDocument> = await collection.insertOne(doc);
  return { ...doc, _id: result.insertedId };
};

export const getUserNotifications = async (tenantId: string, userId: string, options: { readonly limit: number; readonly skip: number }): Promise<NotificationDocument[]> => {
  const collection = getNotificationsCollection();
  return collection
    .find({ tenantId, userId })
    .sort({ createdAt: -1 })
    .skip(options.skip)
    .limit(options.limit)
    .toArray();
};

export const markAllAsSeen = async (tenantId: string, userId: string): Promise<number> => {
  const collection = getNotificationsCollection();
  const result = await collection.updateMany({ tenantId, userId, seen: false }, { $set: { seen: true } });
  return result.modifiedCount ?? 0;
};
