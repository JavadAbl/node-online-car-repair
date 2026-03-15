import { pause } from "../../../utils/app.utils.js";
import Queue from "bee-queue";

class WorkerClient {
  register(queue: Queue, handler: (job: Queue.Job<any>) => any, concurrency = 1, delay = 1000) {
    queue.process(concurrency, async (job) => {
      await pause(delay);
      const res = await handler(job);
      return res;
    });
  }
}

export const workerClient = new WorkerClient();
