import dotenv from "dotenv";
import { connectDatabase } from "../db";
import { seedCatalog } from "../seed";
import logger from "../logger";

dotenv.config();

async function runSeed(): Promise<void> {
  await connectDatabase();
  await seedCatalog();
  logger.info("Catalog seeded successfully");
  process.exit(0);
}

runSeed().catch((err) => {
  logger.error("Seed failed:", err);
  process.exit(1);
});
