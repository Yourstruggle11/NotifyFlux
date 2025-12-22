import { connectMongo, closeMongo } from "../src/infra/db/mongo";
import { runSeed } from "../src/modules/demo/service";
import { env } from "../src/config/env";

const main = async (): Promise<void> => {
  await connectMongo();
  const tenantId = process.env.SEED_TENANT_ID ?? "demo-tenant";
  const seeded = await runSeed(tenantId);
  // eslint-disable-next-line no-console
  console.log(`Seeded tenant ${tenantId}`, seeded);
  await closeMongo();
};

void main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  void closeMongo();
  process.exit(1);
});
