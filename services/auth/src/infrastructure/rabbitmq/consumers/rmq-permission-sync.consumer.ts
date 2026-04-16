import { Channel } from "amqp-connection-manager";
import { rmqConnection } from "../rmq.provider.js";
import { validatePermissionSync } from "../../../schemas/event-schemas/auth/permission-sync.schema.js";
import { authService } from "../../../services/auth.service.js";

export class RabbitMQPermissionSyncConsumer {
  static consume(queue: string) {
    rmqConnection.createChannel({
      setup: async (channel: Channel) => {
        await channel.consume(queue, async (msg) => {
          if (!msg) return;

          const content = msg.content;

          try {
            const payload = validatePermissionSync(JSON.parse(content as unknown as string));
            console.log(232331);

            await authService.syncPermission(payload);
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
