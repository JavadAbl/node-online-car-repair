import { config } from "../config.js";
import { RabbitMQClient } from "./client/rmq-client.js";
import { RabbitMQConsumer } from "./client/rmq-cosumer.js";
import { RabbitMQSetup } from "./client/rmq-setup.js";
import { RMQ_Q_CUSTOMER_CREATE, RMQ_Q_RK_CUSTOMER_CREATE } from "./config/rmq-config.js";
import { RabbitMQInboxHandler } from "./handlers/rmq-inbox.handler.js";

const rmqClient = new RabbitMQClient(config.RABBITMQ_URL);
const connection = rmqClient.connect();

export async function startRmq() {
  const setup = new RabbitMQSetup(connection);
  await setup.setupQueue(RMQ_Q_CUSTOMER_CREATE, RMQ_Q_RK_CUSTOMER_CREATE);

  const consumer = new RabbitMQConsumer(connection);
  consumer.consume(RMQ_Q_CUSTOMER_CREATE, RabbitMQInboxHandler.handle);
}

export async function stopRmq() {
  await rmqClient.close();
}
