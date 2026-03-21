//cron.provider.ts
import { cronClient } from "./client/cron-client.js";
import { CronExpression } from "./config/cron-expression.js";
import { CRON_JOB_INBOX } from "./config/cron.config.js";
import { CronEventsHandler } from "./handlers/cron-events.handler.js";

export function startCronClient(): void {
  // Wrap the handler with the locking mechanism
  const handleInboxEvents = createLockingTask(CronEventsHandler.handleInboxEvents);

  cronClient.addJob(CRON_JOB_INBOX, CronExpression.EVERY_10_SECONDS, handleInboxEvents);
}

/**
 * A wrapper to prevent overlapping executions.
 * It ensures the handler is not called again until the previous call finishes.
 */
const createLockingTask = (task: () => Promise<void> | void) => {
  let isRunning = false;

  return async () => {
    // If the previous job is still running, skip this execution
    if (isRunning) {
      console.log(`Cron Job skipped: Previous execution is still in progress.`);
      return;
    }

    isRunning = true;
    try {
      await task();
    } catch (error) {
      // Optional: Log errors here so the lock is released even if the task crashes
      console.error("[Cron] Error in task execution:", error);
    } finally {
      // Ensure the lock is always released
      isRunning = false;
    }
  };
};
