import { MongoClient, Db, Collection, ChangeStream, ChangeStreamDocument } from "mongodb";
import { env } from "../../config/env";
import { logger } from "../logging/logger";
import type { NotificationDocument } from "../../modules/notifications/model";
import type { UserDocument } from "../../modules/users/model";

let client: MongoClient | null = null;
let database: Db | null = null;

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const connectMongo = async (): Promise<Db> => {
  if (database) {
    return database;
  }

  const maxAttempts = 5;
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < maxAttempts) {
    try {
      client = new MongoClient(env.mongoUri);
      await client.connect();
      database = client.db(env.mongoDbName);
      await ensureIndexes(database);
      logger.info({ db: env.mongoDbName }, "Connected to MongoDB");
      return database;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown Mongo connection error");
      attempt += 1;
      const backoffMs = 200 * 2 ** attempt;
      logger.warn({ attempt, backoffMs, error: lastError }, "Mongo connection failed, retrying");
      await wait(backoffMs);
    }
  }

  throw lastError ?? new Error("Failed to connect to MongoDB");
};

export const getDb = (): Db => {
  if (!database) {
    throw new Error("MongoDB not initialized");
  }
  return database;
};

export const getNotificationsCollection = (): Collection<NotificationDocument> => getDb().collection<NotificationDocument>("notifications");
export const getUsersCollection = (): Collection<UserDocument> => getDb().collection<UserDocument>("users");

const ensureIndexes = async (db: Db): Promise<void> => {
  await db.collection<NotificationDocument>("notifications").createIndex({ tenantId: 1, userId: 1, seen: 1, createdAt: -1 });
  await db.collection<UserDocument>("users").createIndex({ tenantId: 1, email: 1 }, { unique: true });
};

export const openNotificationsChangeStream = (): ChangeStream<NotificationDocument, ChangeStreamDocument<NotificationDocument>> => {
  const collection = getNotificationsCollection();
  return collection.watch([], { fullDocument: "updateLookup" });
};

export const closeMongo = async (): Promise<void> => {
  if (!client) {
    return;
  }
  await client.close();
  client = null;
  database = null;
};
