import { AmqpConnectionManager, ChannelWrapper } from "amqp-connection-manager";
import { randomUUID } from "crypto";
import { RpcReply } from "../../../schemas/common/rpc-reply.schema.js";

type PendingRequest = {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timer: NodeJS.Timeout;
};

export class RmqRpcClient {
  private channel: ChannelWrapper;
  replyQueue: string | null = null;
  private pendingRequests = new Map<string, PendingRequest>();

  constructor(connection: AmqpConnectionManager) {
    this.channel = connection.createChannel({ json: false });
  }

  async connect() {
    // Exclusive reply queue
    await this.channel.waitForConnect();
    const { queue } = await this.channel.assertQueue("", { exclusive: true, durable: false });
    this.replyQueue = queue;

    // Single shared consumer for all replies
    await this.channel.consume(
      this.replyQueue,
      (msg) => {
        if (!msg) return;
        const correlationId = msg.properties.correlationId;
        const pending = this.pendingRequests.get(correlationId);
        if (pending) {
          clearTimeout(pending.timer);
          this.pendingRequests.delete(correlationId);
          try {
            const payload = JSON.parse(msg.content.toString());
            pending.resolve(payload);
          } catch (err) {
            pending.reject(err);
          }
        }
        // If correlationId unknown, message is ignored (auto-acked because noAck: true)
      },
      { noAck: true },
    );
  }

  async request<R, T>(
    rpcConfig: { queue: string; rpcKey: string },
    payload: T,
    timeout = 10000,
  ): Promise<RpcReply<R>> {
    if (!this.channel || !this.replyQueue) {
      throw new Error("Not connected. Call connect() first.");
    }

    const correlationId = randomUUID();

    const responsePromise = new Promise<any>((resolve, reject) => {
      const timer = setTimeout(() => {
        // Timeout – clean up and reject
        this.pendingRequests.delete(correlationId);
        reject(new Error(`RPC timeout after ${timeout}ms`));
      }, timeout);

      this.pendingRequests.set(correlationId, { resolve, reject, timer });
    });

    // Publish the request
    this.channel.sendToQueue(rpcConfig.queue, Buffer.from(JSON.stringify(payload)), {
      correlationId,
      replyTo: this.replyQueue,
      headers: { "x-rpc-key": rpcConfig.rpcKey },
    });

    return responsePromise;
  }

  async close() {
    // Clear all pending requests
    for (const [id, pending] of this.pendingRequests) {
      clearTimeout(pending.timer);
      pending.reject(new Error("Client closed"));
    }
    this.pendingRequests.clear();
    if (this.channel) await this.channel.close();
  }
}
