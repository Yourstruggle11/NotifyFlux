import bcrypt from "bcryptjs";
import { CreateNotificationInput, NotificationDocument } from "../notifications/model";
import { createNotification } from "../notifications/service";
import { getUsersCollection, getNotificationsCollection } from "../../infra/db/mongo";
import { Role } from "../../shared/types";

type SeedUser = {
  readonly userId: string;
  readonly email: string;
  readonly password: string;
  readonly roles: ReadonlyArray<Role>;
};

type SeedResult = {
  readonly createdUsers: number;
  readonly createdNotifications: number;
  readonly users: ReadonlyArray<{ readonly email: string; readonly password: string; readonly roles: ReadonlyArray<Role> }>;
};

const seedUsers: ReadonlyArray<SeedUser> = [
  { userId: "admin1", email: "admin@example.com", password: "changeme", roles: ["admin", "user"] },
  { userId: "ops1", email: "ops@example.com", password: "changeme", roles: ["service", "user"] },
  { userId: "user1", email: "user@example.com", password: "changeme", roles: ["user"] }
];

const seedNotifications = (tenantId: string): ReadonlyArray<CreateNotificationInput> => [
  {
    tenantId,
    userId: "admin1",
    type: "system",
    message: "Tenant wiring completed",
    metadata: { severity: "info" }
  },
  {
    tenantId,
    userId: "user1",
    type: "welcome",
    message: "Welcome to NotifyFlux! This is your first notification.",
    metadata: { plan: "demo" }
  },
  {
    tenantId,
    userId: "ops1",
    type: "ops",
    message: "Redis adapter linked across nodes",
    metadata: { component: "socket", status: "ok" }
  }
];

export const runSeed = async (tenantId: string): Promise<SeedResult> => {
  const usersCollection = getUsersCollection();
  const notificationsCollection = getNotificationsCollection();
  let createdUsers = 0;
  let createdNotifications = 0;

  // Seed users with upsert to avoid duplicates on repeated runs.
  for (const u of seedUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const result = await usersCollection.updateOne(
      { tenantId, email: u.email.toLowerCase() },
      {
        $setOnInsert: {
          tenantId,
          userId: u.userId,
          email: u.email.toLowerCase(),
          passwordHash,
          roles: u.roles,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    if (result.upsertedCount === 1) {
      createdUsers += 1;
    }
  }

  // Seed notifications; avoid duplicates by checking existing count per type/message pair.
  for (const n of seedNotifications(tenantId)) {
    const exists = await notificationsCollection.findOne({
      tenantId,
      userId: n.userId,
      type: n.type,
      message: n.message
    });
    if (exists) {
      continue;
    }
    const doc: NotificationDocument = await createNotification(n);
    if (doc._id) {
      createdNotifications += 1;
    }
  }

  return {
    createdUsers,
    createdNotifications,
    users: seedUsers.map((u) => ({ email: u.email, password: u.password, roles: u.roles }))
  };
};
