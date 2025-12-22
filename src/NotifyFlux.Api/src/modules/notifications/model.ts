import { ObjectId } from "mongodb";

export type NotificationId = string;

export type NotificationDocument = {
  readonly _id?: ObjectId;
  readonly tenantId: string;
  readonly userId: string;
  readonly type: string;
  readonly message: string;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
  readonly seen: boolean;
  readonly createdAt: Date;
};

export type CreateNotificationInput = {
  readonly tenantId: string;
  readonly userId: string;
  readonly type: string;
  readonly message: string;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
};
