import { validateRolePermissionCreate } from "../../schemas/event-schemas/auth/create-role-permission.schema.js";
import { validateRolePermissionDelete } from "../../schemas/event-schemas/auth/delete-role-permission.schema.js";
import { validateCustomerCreate } from "../../schemas/event-schemas/customer/create-customer.schema.js";
import { validateCustomerUpdate } from "../../schemas/event-schemas/customer/update-customer.schema.js";
import { validateServiceCreate } from "../../schemas/event-schemas/service/create-service.schema.js";
import { validateServiceUpdate } from "../../schemas/event-schemas/service/update-service.schema.js";
import { validateTechnicianCreate } from "../../schemas/event-schemas/technician/create-technician.schema.js";
import { validateTechnicianUpdate } from "../../schemas/event-schemas/technician/update-technician.schema.js";
import { config } from "../config.js";
import { RabbitMQClient } from "./client/rmq-client.js";
import { RabbitMQConsumer } from "./client/rmq-consumer.js";
import { RabbitMQPublisher } from "./client/rmq-publisher.js";
import { RmqRpcClient } from "./client/rmq-rpc-client.js";
import { RabbitMQSetup } from "./client/rmq-setup.js";
import {
  RMQ_Q_AUTH_ROLE_PERMISSION_CREATE,
  RMQ_Q_AUTH_ROLE_PERMISSION_DELETE,
  RMQ_Q_CUSTOMER_CREATE,
  RMQ_Q_CUSTOMER_UPDATE,
  RMQ_Q_RK_AUTH_ROLE_PERMISSION_CREATE,
  RMQ_Q_RK_AUTH_ROLE_PERMISSION_DELETE,
  RMQ_Q_RK_CUSTOMER_CREATE,
  RMQ_Q_RK_CUSTOMER_UPDATE,
  RMQ_Q_RK_SERVICE_CREATE,
  RMQ_Q_RK_SERVICE_UPDATE,
  RMQ_Q_RK_TECHNICIAN_CREATE,
  RMQ_Q_RK_TECHNICIAN_UPDATE,
  RMQ_Q_SERVICE_CREATE,
  RMQ_Q_SERVICE_UPDATE,
  RMQ_Q_TECHNICIAN_CREATE,
  RMQ_Q_TECHNICIAN_UPDATE,
} from "./config/rmq-config.js";
import { RabbitMQInboxHandler } from "./handlers/rmq-inbox.handler.js";

const rmqClient = new RabbitMQClient(config.RABBITMQ_URL);
const connection = rmqClient.connect();
export const rmqRpcClient = new RmqRpcClient(connection);

export async function startRmq() {
  await rmqRpcClient.connect();
  const setup = new RabbitMQSetup(connection);
  await setup.setupQueue(RMQ_Q_CUSTOMER_CREATE, RMQ_Q_RK_CUSTOMER_CREATE);
  await setup.setupQueue(RMQ_Q_CUSTOMER_UPDATE, RMQ_Q_RK_CUSTOMER_UPDATE);
  await setup.setupQueue(RMQ_Q_SERVICE_CREATE, RMQ_Q_RK_SERVICE_CREATE);
  await setup.setupQueue(RMQ_Q_SERVICE_UPDATE, RMQ_Q_RK_SERVICE_UPDATE);
  await setup.setupQueue(RMQ_Q_TECHNICIAN_CREATE, RMQ_Q_RK_TECHNICIAN_CREATE);
  await setup.setupQueue(RMQ_Q_TECHNICIAN_UPDATE, RMQ_Q_RK_TECHNICIAN_UPDATE);
  await setup.setupQueue(RMQ_Q_AUTH_ROLE_PERMISSION_CREATE, RMQ_Q_RK_AUTH_ROLE_PERMISSION_CREATE);
  await setup.setupQueue(RMQ_Q_AUTH_ROLE_PERMISSION_DELETE, RMQ_Q_RK_AUTH_ROLE_PERMISSION_DELETE);

  const consumer = new RabbitMQConsumer(connection);
  consumer.consume(RMQ_Q_CUSTOMER_CREATE, validateCustomerCreate, RabbitMQInboxHandler.handle);
  consumer.consume(RMQ_Q_CUSTOMER_UPDATE, validateCustomerUpdate, RabbitMQInboxHandler.handle);
  consumer.consume(RMQ_Q_SERVICE_CREATE, validateServiceCreate, RabbitMQInboxHandler.handle);
  consumer.consume(RMQ_Q_SERVICE_UPDATE, validateServiceUpdate, RabbitMQInboxHandler.handle);
  consumer.consume(RMQ_Q_TECHNICIAN_CREATE, validateTechnicianCreate, RabbitMQInboxHandler.handle);
  consumer.consume(RMQ_Q_TECHNICIAN_UPDATE, validateTechnicianUpdate, RabbitMQInboxHandler.handle);
  consumer.consume(
    RMQ_Q_AUTH_ROLE_PERMISSION_CREATE,
    validateRolePermissionCreate,
    RabbitMQInboxHandler.handle,
  );
  consumer.consume(
    RMQ_Q_AUTH_ROLE_PERMISSION_DELETE,
    validateRolePermissionDelete,
    RabbitMQInboxHandler.handle,
  );
}

export async function stopRmq() {
  await rmqRpcClient.close();
  await rmqClient.close();
}

export const rmqPublisher = new RabbitMQPublisher(connection);
