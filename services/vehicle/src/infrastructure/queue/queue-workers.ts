import Queue from "bee-queue";
import { pause } from "../../utils/app-utils.js";
import {
  queueEventCustomerCreate,
  queueEventCustomerUpdate,
  queueEventServiceCreate,
  queueEventServiceUpdate,
} from "./queue-provider.js";
import {
  queueCustomerCreateHandler,
  queueCustomerUpdateHandler,
} from "./queue-handlers/queue-customer-handlers.js";
import {
  queueServiceCreateHandler,
  queueServiceUpdateHandler,
} from "./queue-handlers/queue-service-handlers.js";

function queueWorkerRegister(
  queue: Queue,
  handler: (job: Queue.Job<any>) => any,
  concurrency = 1,
  delay = 1000,
) {
  queue.process(concurrency, async (job) => {
    await pause(delay);
    const res = await handler(job);
    return res;
  });
}

export function startQueueWorkers() {
  queueWorkerRegister(queueEventCustomerCreate, queueCustomerCreateHandler);
  queueWorkerRegister(queueEventCustomerUpdate, queueCustomerUpdateHandler);

  queueWorkerRegister(queueEventServiceCreate, queueServiceCreateHandler);
  queueWorkerRegister(queueEventServiceUpdate, queueServiceUpdateHandler);
}
