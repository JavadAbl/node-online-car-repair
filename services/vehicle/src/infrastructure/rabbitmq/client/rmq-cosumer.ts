import { Channel, AmqpConnectionManager } from "amqp-connection-manager";

export type EventHandler = (
  queue: string,
  messageId: string,
  appId: string,
  routingKey: string,
  payload: string,
) => Promise<void>;

export class RabbitMQConsumer {
  constructor(private readonly connection: AmqpConnectionManager) {}

  consume(queue: string, validator: (obj: any) => boolean, handler: EventHandler) {
    this.connection.createChannel({
      setup: async (channel: Channel) => {
        await channel.consume(queue, async (msg) => {
          if (!msg) return;

          const fields = msg.fields;
          const properties = msg.properties;
          const content = msg.content;
          validator(JSON.parse(content as unknown as string));

          try {
            await handler(
              queue,
              properties.messageId,
              properties.appId,
              fields.routingKey,
              content.toString("utf8"),
            );
            channel.ack(msg);
          } catch (err) {
            console.error(`[❌] Consumer failed: ${queue}`, err);
            channel.nack(msg, false, false);
          }
        });
      },
    });
  }
}
