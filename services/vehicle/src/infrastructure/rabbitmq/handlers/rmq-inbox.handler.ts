import { prisma } from "../../database/prisma-provider.js";

export class RabbitMQInboxHandler {
  static async handle(queue: string, messageId: string, appId: string, routingKey: string, payload: string) {
    const existingEvent = await prisma.inboxEvent.findUnique({ where: { messageId } });
    if (existingEvent) {
      console.log(`Duplicate rmq message with messageId ${messageId} found`);
      return;
    }
    await prisma.inboxEvent.create({ data: { payload, routingKey, queue, appId, messageId } });
  }
}
