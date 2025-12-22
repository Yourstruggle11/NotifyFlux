import { ChangeStream, ChangeStreamInsertDocument } from "mongodb";
import { logger } from "../../infra/logging/logger";
import { openNotificationsChangeStream } from "../../infra/db/mongo";
import { emitNotification } from "./emitter";
import { NotificationDocument } from "./model";
import { incrementChangeStreamRestarts } from "../../infra/monitoring/metrics";

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const handleChange = (change: ChangeStreamInsertDocument<NotificationDocument>): void => {
  if (change.operationType !== "insert" || !change.fullDocument) {
    return;
  }
  emitNotification(change.fullDocument);
};

const subscribeOnce = async (): Promise<void> => {
  const stream: ChangeStream<NotificationDocument> = openNotificationsChangeStream();

  await new Promise<void>((resolve, reject) => {
    stream.on("change", (change) => {
      if (change.operationType === "insert") {
        handleChange(change as ChangeStreamInsertDocument<NotificationDocument>);
      }
    });
    stream.on("error", (err) => reject(err));
    stream.on("close", () => reject(new Error("Change stream closed")));
  }).finally(() => {
    void stream.close();
  });
};

export const startNotificationChangeStream = async (): Promise<void> => {
  let attempt = 0;
  for (;;) {
    try {
      await subscribeOnce();
      attempt = 0;
    } catch (error) {
      attempt += 1;
      const backoffMs = Math.min(1000 * attempt, 10000);
      incrementChangeStreamRestarts();
      logger.warn({ error, backoffMs }, "Change stream interrupted, restarting");
      await wait(backoffMs);
    }
  }
};
