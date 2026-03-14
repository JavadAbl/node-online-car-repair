import { AmqpConnectionManager, ChannelWrapper } from "amqp-connection-manager";
import { RMQ_EXCHANGE } from "../config/rmq-config.js";

export class RabbitMQPublisher {
  private channel: ChannelWrapper;

  constructor(connection: AmqpConnectionManager) {
    this.channel = connection.createChannel({
      json: false, // Automatically stringify JSON
    });
  }

  async publish<T>(routingKey: string, event: T, appId: string) {
    await this.channel.publish(RMQ_EXCHANGE, routingKey, event, { appId, persistent: true });
  }
}
