import { Channel, AmqpConnectionManager } from "amqp-connection-manager";
import { RMQ_EXCHANGE } from "../config/rmq-config.js";

export class RabbitMQSetup {
  constructor(private readonly connection: AmqpConnectionManager) {}

  async setupQueue(queue: string, routingKeys: string[]) {
    const channelWrapper = this.connection.createChannel({
      setup: async (channel: Channel) => {
        await channel.assertExchange(RMQ_EXCHANGE, "direct", { durable: true });

        const retryQueue = `${queue}-retry`;
        const retryRK = `${queue}-retry-rk`;
        const queueDLQ = `${queue}-dlq`;

        await channel.assertQueue(retryQueue, {
          durable: true,
          arguments: {
            "x-dead-letter-exchange": RMQ_EXCHANGE,
            "x-dead-letter-routing-key": queueDLQ,
            "x-message-ttl": 60000,
          },
        });
        await channel.bindQueue(retryQueue, RMQ_EXCHANGE, retryRK);

        await channel.assertQueue(queue, {
          durable: true,
          arguments: { "x-dead-letter-exchange": RMQ_EXCHANGE, "x-dead-letter-routing-key": retryRK },
        });

        for (const rk of routingKeys) await channel.bindQueue(queue, RMQ_EXCHANGE, rk);
        await channel.bindQueue(queue, RMQ_EXCHANGE, queueDLQ);
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
