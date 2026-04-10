//cron-events.handler.ts
import { InboxEventStatus } from "../../database/generated/prisma/enums.js";
import { prisma } from "../../database/prisma-provider.js";
import { jobClient } from "../../queue/client/job-client.js";
import {
  queueEventCustomerCreate,
  queueEventCustomerUpdate,
  queueEventRolePermissionCreate,
  queueEventRolePermissionDelete,
  queueEventServiceCreate,
  queueEventServiceUpdate,
} from "../../queue/queue-provider.js";
import {
  RMQ_Q_AUTH_ROLE_PERMISSION_CREATE,
  RMQ_Q_AUTH_ROLE_PERMISSION_DELETE,
  RMQ_Q_CUSTOMER_CREATE,
  RMQ_Q_CUSTOMER_UPDATE,
  RMQ_Q_RK_SERVICE_UPDATE,
  RMQ_Q_SERVICE_CREATE,
  RMQ_Q_SERVICE_UPDATE,
} from "../../rabbitmq/config/rmq-config.js";

export class CronEventsHandler {
  static async handleInboxEvents() {
    const unhandledEvents = await prisma.inboxEvent.findMany({ where: { status: InboxEventStatus.Pending } });

    for (const event of unhandledEvents) {
      switch (event.queue) {
        case RMQ_Q_CUSTOMER_CREATE:
          jobClient.create(queueEventCustomerCreate, event);
          break;

        case RMQ_Q_CUSTOMER_UPDATE:
          jobClient.create(queueEventCustomerUpdate, event);
          break;

        case RMQ_Q_SERVICE_CREATE:
          jobClient.create(queueEventServiceCreate, event);
          break;

        case RMQ_Q_SERVICE_UPDATE:
          jobClient.create(queueEventServiceUpdate, event);
          break;

        case RMQ_Q_AUTH_ROLE_PERMISSION_CREATE:
          jobClient.create(queueEventRolePermissionCreate, event);
          break;

        case RMQ_Q_AUTH_ROLE_PERMISSION_DELETE:
          jobClient.create(queueEventRolePermissionDelete, event);
          break;

        default:
          break;
      }
    }
  }
}
