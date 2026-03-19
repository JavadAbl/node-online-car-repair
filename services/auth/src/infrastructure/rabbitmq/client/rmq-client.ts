import amqp, { AmqpConnectionManager } from "amqp-connection-manager";

export class RabbitMQClient {
  private connection!: AmqpConnectionManager;

  constructor(private readonly url: string) {}

  connect(): AmqpConnectionManager {
    if (this.connection) return this.connection;

    this.connection = amqp.connect([this.url]);

    this.connection.on("connect", () => {
      console.log("[✅] Connected to RabbitMQ");
    });

    this.connection.on("disconnect", (err) => {
      console.error("[❌] RabbitMQ disconnected:", err.err?.message);
    });

    return this.connection;
  }

  async close() {
    if (!this.connection) return;
    console.log("[🛑] Closing RabbitMQ connection...");
    await this.connection.close();
    console.log("[✅] RabbitMQ connection closed");
  }
}
