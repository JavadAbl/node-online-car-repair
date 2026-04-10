//queue - provider.ts;
import Queue from "bee-queue";
import {
  QUEUE_EVENT_CUSTOMER_CREATE,
  QUEUE_EVENT_CUSTOMER_UPDATE,
  QUEUE_EVENT_ROLE_PERMISSION_CREATE,
  QUEUE_EVENT_ROLE_PERMISSION_DELETE,
  QUEUE_EVENT_SERVICE_CREATE,
  QUEUE_EVENT_SERVICE_UPDATE,
} from "./config/queue-config.js";
import { queueClient } from "./client/queue-client.js";
import { workerClient } from "./client/worker-client.js";
import {
  queueCustomerCreateHandler,
  queueCustomerUpdateHandler,
} from "./handlers/queue-customer-handlers.js";
import { queueServiceCreateHandler, queueServiceUpdateHandler } from "./handlers/queue-service-handlers.js";
import {
  queueRolePermissionCreateHandler,
  queueRolePermissionDeleteHandler,
} from "./handlers/queue-auth-handlers.js";

export let queueEventCustomerCreate: Queue;
export let queueEventCustomerUpdate: Queue;
export let queueEventServiceCreate: Queue;
export let queueEventServiceUpdate: Queue;
export let queueEventRolePermissionCreate: Queue;
export let queueEventRolePermissionDelete: Queue;

export function startQueues() {
  queueEventCustomerCreate = queueClient.create(QUEUE_EVENT_CUSTOMER_CREATE);
  queueEventCustomerUpdate = queueClient.create(QUEUE_EVENT_CUSTOMER_UPDATE);
  queueEventServiceCreate = queueClient.create(QUEUE_EVENT_SERVICE_CREATE);
  queueEventServiceUpdate = queueClient.create(QUEUE_EVENT_SERVICE_UPDATE);
  queueEventRolePermissionCreate = queueClient.create(QUEUE_EVENT_ROLE_PERMISSION_CREATE);
  queueEventRolePermissionDelete = queueClient.create(QUEUE_EVENT_ROLE_PERMISSION_DELETE);

  workerClient.register(queueEventCustomerCreate, queueCustomerCreateHandler);
  workerClient.register(queueEventCustomerUpdate, queueCustomerUpdateHandler);
  workerClient.register(queueEventServiceCreate, queueServiceCreateHandler);
  workerClient.register(queueEventServiceUpdate, queueServiceUpdateHandler);
  workerClient.register(queueEventRolePermissionCreate, queueRolePermissionCreateHandler);
  workerClient.register(queueEventRolePermissionDelete, queueRolePermissionDeleteHandler);
}

export const queueGracefulShutdown = async () => {
  await queueEventCustomerCreate.close();
  await queueEventCustomerUpdate.close();
  await queueEventServiceCreate.close();
  await queueEventServiceUpdate.close();
  await queueEventRolePermissionCreate.close();
  await queueEventRolePermissionDelete.close();
  // console.log(`Worker ${queueEventCustomerCreate.name} stopped.`);
};
