import { config } from "../config.js";
import { RabbitMQClient } from "./client/rmq-client.js";
import { RabbitMQPublisher } from "./client/rmq-publisher.js";
import { RabbitMQSetup } from "./client/rmq-setup.js";
import { RMQ_Q_PERMISSION_SYNC, RMQ_Q_RK_CUSTOMER_PERMISSION_SYNC } from "./config/rmq-config.js";
import { RabbitMQPermissionSyncConsumer } from "./consumers/rmq-permission-sync.consumer.js";

const rmqClient = new RabbitMQClient(config.RABBITMQ_URL);
export const rmqConnection = rmqClient.connect();

export async function startRmq() {
  const setup = new RabbitMQSetup(rmqConnection);
  await setup.setupQueue(RMQ_Q_PERMISSION_SYNC, [RMQ_Q_RK_CUSTOMER_PERMISSION_SYNC]);

  RabbitMQPermissionSyncConsumer.consume(RMQ_Q_PERMISSION_SYNC);
}

export async function stopRmq() {
  await rmqClient.close();
}

export const rmqPublisher = new RabbitMQPublisher(rmqConnection);
