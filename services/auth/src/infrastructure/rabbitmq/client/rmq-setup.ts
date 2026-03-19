import { Channel, AmqpConnectionManager } from "amqp-connection-manager";
import { RMQ_EXCHANGE } from "../config/rmq-config.js";

export class RabbitMQSetup {
  constructor(private readonly connection: AmqpConnectionManager) {}

  async setupExchange() {
    const channelWrapper = this.connection.createChannel({
      setup: async (channel: Channel) => {
        await channel.assertExchange(RMQ_EXCHANGE, "direct", { durable: true });
      },
    });

    return new Promise((res, rej) => {
      channelWrapper.on("connect", () => {
        channelWrapper.close();
        res(undefined);
      });
      channelWrapper.on("error", rej);
    });
  }
}
