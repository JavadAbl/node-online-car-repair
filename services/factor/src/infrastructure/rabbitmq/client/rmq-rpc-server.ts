// rpc-server.js

import { AmqpConnectionManager, ChannelWrapper } from "amqp-connection-manager";

export class RabbitMQRPCServer {
  private channel: ChannelWrapper;

  constructor(
    private readonly rpcQueueName: string,
    private readonly handlers: Record<string, (payload: any) => any>,
    connection: AmqpConnectionManager,
  ) {
    this.channel = connection.createChannel();
  }

  async runRPCServer() {
    await this.channel.assertQueue(this.rpcQueueName, { durable: false });
    console.log(" [*] RPC server waiting for messages...");
    this.process();
  }

  process() {
    // Consume messages from the queue
    this.channel.consume(this.rpcQueueName, async (msg) => {
      if (!msg) return;

      const key: string = msg.properties.headers?.["x-rpc-key"];
      if (!key) return;

      // Parse the incoming message
      const payload = JSON.parse(msg.content.toString());

      // Process the request (your business logic here)
      const handler = this.handlers?.[key];
      if (!handler) return;
      const result = await handler(payload);

      // Send the reply back to the reply queue
      this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(result)), {
        correlationId: msg.properties.correlationId, // Match the request
      });

      // Acknowledge the original message
      this.channel.ack(msg);
    });
  }
}
