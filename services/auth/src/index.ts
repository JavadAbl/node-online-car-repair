import { startCacheClient } from "./infrastructure/cache/cache-provider.js";
import { validateConfig } from "./infrastructure/config.js";
import { startDatabase } from "./infrastructure/database/prisma-provider.js";
import { startRmq, stopRmq } from "./infrastructure/rabbitmq/rmq.provider.js";
import { startHttpServer } from "./server.js";

async function run() {
  validateConfig();
  await startDatabase();
  await startHttpServer();
  await startRmq();
  await startCacheClient();
  console.log(123);

  try {
  } catch (error: any) {
    console.error(error?.message, error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("Received SIGINT. Starting graceful shutdown...");
  await gracefulShutdown();
});
process.on("SIGTERM", async () => {
  console.log("Received SIGINT. Starting graceful shutdown...");
  await gracefulShutdown();
});

async function gracefulShutdown() {
  await stopRmq();
  process.exit(0);
}

run();
