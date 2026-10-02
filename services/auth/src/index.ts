import { startCacheClient } from "./infrastructure/cache/cache-provider.js";
import { validateConfig } from "./infrastructure/config.js";
import { startDatabase } from "./infrastructure/database/prisma-provider.js";
import { startRmq, stopRmq } from "./infrastructure/rabbitmq/rmq.provider.js";
import { startHttpServer } from "./server.js";
import { collectedRoutePermissions } from "./plugins/auth.plugin.js";
import { derivePermissionList } from "./infrastructure/auth/auth-utils.js";
import { authService } from "./services/auth.service.js";

/** How often expired RefreshToken rows are swept (6h). */
const REFRESH_PRUNE_INTERVAL_MS = 6 * 60 * 60 * 1000;

function scheduleRefreshTokenPruning() {
  const prune = async () => {
    try {
      const removed = await authService.pruneExpiredRefreshTokens();
      if (removed > 0) console.log(`[prune] removed ${removed} expired refresh-token rows`);
    } catch (error: any) {
      console.error("[prune] failed:", error?.message ?? error);
    }
  };
  void prune();
  setInterval(prune, REFRESH_PRUNE_INTERVAL_MS).unref();
}

async function run() {
  validateConfig();
  await startDatabase();
  await startHttpServer();
  await startRmq();
  await startCacheClient();

  try {
    // Publish this service's own route permissions into the global catalog
    // (collected by the auth guard plugin during route registration).
    await authService.publishOwnPermissions(derivePermissionList("auth", [...collectedRoutePermissions]));
  } catch (error: any) {
    console.error(error?.message, error);
    process.exit(1);
  }

  scheduleRefreshTokenPruning();
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
