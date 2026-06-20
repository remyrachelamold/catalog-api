import dotenv from "dotenv";

dotenv.config();

export {
  getCatalogs,
  addCatalogItem,
  updateCatalogItem,
  patchCatalogItem,
  deleteCatalogItem,
} from "./controllers/itemController";

import app from "./app";
import { connectDatabase } from "./db";
import logger from "./logger";

const PORT = process.env.PORT || 3000;

async function startServer(): Promise<void> {
  await connectDatabase();
  app.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    logger.error("Failed to start server:", err);
    process.exit(1);
  });
}

export default app;
