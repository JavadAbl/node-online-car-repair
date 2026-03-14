import { InboxEventStatus } from "../../database/generated/prisma/enums.js";
import { prisma } from "../../database/prisma-provider.js";
import { queueProduce } from "../../queue/queue-producer.js";
import {
  queueEventCustomerCreate,
  queueEventCustomerUpdate,
  queueEventServiceCreate,
  queueEventServiceUpdate,
} from "../../queue/queue-provider.js";
import {
  RMQ_Q_CUSTOMER_CREATE,
  RMQ_Q_CUSTOMER_UPDATE,
  RMQ_Q_RK_SERVICE_UPDATE,
  RMQ_Q_SERVICE_CREATE,
} from "../../rabbitmq/config/rmq-config.js";

export class CronInboxHandler {
  static async handle() {
    const unhandledEvents = await prisma.inboxEvent.findMany({ where: { status: InboxEventStatus.Pending } });

    for (const event of unhandledEvents) {
      switch (event.queue) {
        case RMQ_Q_CUSTOMER_CREATE:
          queueProduce(queueEventCustomerCreate, event);
          break;

        case RMQ_Q_CUSTOMER_UPDATE:
          queueProduce(queueEventCustomerUpdate, event);
          break;

        case RMQ_Q_SERVICE_CREATE:
          queueProduce(queueEventServiceCreate, event);
          break;

        case RMQ_Q_RK_SERVICE_UPDATE:
          queueProduce(queueEventServiceUpdate, event);
          break;

        default:
          break;
      }
    }
  }
}
