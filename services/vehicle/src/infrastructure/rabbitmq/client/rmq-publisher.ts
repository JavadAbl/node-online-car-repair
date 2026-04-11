import { randomUUID } from "crypto";
import { AmqpConnectionManager, ChannelWrapper } from "amqp-connection-manager";
import { RMQ_APP_ID, RMQ_EXCHANGE } from "../config/rmq-config.js";
import { prisma } from "../../database/prisma-provider.js";

export class RabbitMQPublisher {
  private channel: ChannelWrapper;

  constructor(connection: AmqpConnectionManager) {
    this.channel = connection.createChannel({
      json: false, // Automatically stringify JSON
    });
  }

  async publish<T>(routingKey: string, payload: T) {
    const serializedPayload = JSON.stringify(payload);
    const messageId = randomUUID();

    await this.channel.publish(RMQ_EXCHANGE, routingKey, serializedPayload, {
      appId: RMQ_APP_ID,
      messageId,
      persistent: true,
    });
    await prisma.outboxEvent.create({ data: { routingKey, payload: serializedPayload, messageId } });
  }

  async publishNoLog<T>(routingKey: string, payload: T) {
    const messageId = randomUUID();

    await this.channel.publish(RMQ_EXCHANGE, routingKey, JSON.stringify(payload), {
      appId: RMQ_APP_ID,
      messageId,
      persistent: true,
    });
  }
}
