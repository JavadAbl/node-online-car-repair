import { config } from "../config.js";
import { RabbitMQClient } from "./client/rmq-client.js";
import { RabbitMQPublisher } from "./client/rmq-publisher.js";
import { RabbitMQSetup } from "./client/rmq-setup.js";

const rmqClient = new RabbitMQClient(config.RABBITMQ_URL);
const connection = rmqClient.connect();

export async function startRmq() {
  const setup = new RabbitMQSetup(connection);
  await setup.setupExchange();
}

export async function stopRmq() {
  await rmqClient.close();
}

export const rmqPublisher = new RabbitMQPublisher(connection);
