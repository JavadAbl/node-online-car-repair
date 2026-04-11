import { authService } from "./infrastructure/auth/auth.service.js";
import { validateConfig } from "./infrastructure/config.js";
import { startDatabase } from "./infrastructure/database/prisma-provider.js";
import { startCronClient } from "./infrastructure/node-cron/cron.provider.js";
import { queueGracefulShutdown, startQueues } from "./infrastructure/queue/queue-provider.js";
import { startRmq, stopRmq } from "./infrastructure/rabbitmq/rmq.provider.js";
import { startHttpServer } from "./server.js";

async function run() {
  validateConfig();
  await startDatabase();
  await startHttpServer();
  await startRmq();
  startQueues();
  startCronClient();
  authService.setupPermissions();
  try {
  } catch (error) {
    console.error(error);
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
  await queueGracefulShutdown();
  process.exit(0);
}

run();
