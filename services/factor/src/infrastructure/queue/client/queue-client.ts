import { config } from "../../config.js";
import Queue from "bee-queue";

class QueueClient {
  create(queueName: string) {
    const host = config.REDIS_HOST;
    const port = config.REDIS_PORT;
    const password = config.REDIS_PASSWORD;

    const queue = new Queue(queueName, {
      redis: { host, port, password },
      removeOnSuccess: true,
      removeOnFailure: true,
    });

    queue.once("ready", () => console.log(`Queue ${queueName} is connected`));

    return queue;
  }
}

export const queueClient = new QueueClient();
