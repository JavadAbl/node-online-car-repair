import { validateConfig } from "./infrastructure/config.js";
import { startDatabase } from "./infrastructure/database/prisma-provider.js";
import { startCronClient } from "./infrastructure/node-cron/cron.provider.js";
import { queueGracefulShutdown, startQueues } from "./infrastructure/queue/queue-provider.js";
import { startRmq, stopRmq } from "./infrastructure/rabbitmq/rmq.provider.js";
import { rmqPublisher } from "./infrastructure/rabbitmq/rmq.provider.js";
import { RMQ_P_RK_PERMISSIONS } from "./infrastructure/rabbitmq/config/rmq-config.js";
import {
  collectFactorPermissions,
  derivePermissionList,
  SERVICE_PERMISSION,
} from "./infrastructure/auth/permissions.js";
import { startHttpServer } from "./server.js";

async function run() {
  validateConfig();
  await startDatabase();
  await startHttpServer();
  await startRmq();
  startQueues();
  startCronClient();

  try {
    // Publish this service's permission registry into the auth service's global catalog.
    await rmqPublisher.publish(
      RMQ_P_RK_PERMISSIONS,
      derivePermissionList(SERVICE_PERMISSION, collectFactorPermissions()),
    );
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
