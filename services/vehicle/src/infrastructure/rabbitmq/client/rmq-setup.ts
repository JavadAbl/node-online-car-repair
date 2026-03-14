import { Channel, AmqpConnectionManager } from "amqp-connection-manager";
import { RMQ_EXCHANGE } from "../config/rmq-config.js";

export class RabbitMQSetup {
  constructor(private readonly connection: AmqpConnectionManager) {}

  async setupQueue(queue: string, routingKey: string) {
    const channelWrapper = this.connection.createChannel({
      setup: async (channel: Channel) => {
        await channel.assertExchange(RMQ_EXCHANGE, "direct", { durable: true });

        const retryQueue = `${queue}-retry`;
        await channel.assertQueue(retryQueue, {
          durable: true,
          arguments: {
            "x-dead-letter-exchange": RMQ_EXCHANGE,
            "x-dead-letter-routing-key": routingKey,
            "x-message-ttl": 60000,
          },
        });
        await channel.assertQueue(queue, {
          durable: true,
          arguments: { "x-dead-letter-exchange": RMQ_EXCHANGE, "x-dead-letter-routing-key": retryQueue },
        });

        await channel.bindQueue(retryQueue, RMQ_EXCHANGE, retryQueue);
        await channel.bindQueue(queue, RMQ_EXCHANGE, routingKey);
      },
    });

    return new Promise((res, rej) => {
      channelWrapper.on("connect", () => {
        console.log(`RabbitMQ Queue ${queue} setup complete..`);
        channelWrapper.close();
        res(undefined);
      });
      channelWrapper.on("error", rej);
    });
  }
}
