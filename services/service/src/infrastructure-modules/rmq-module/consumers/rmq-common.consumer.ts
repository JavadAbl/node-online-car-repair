import { InboxEventRepository } from '../../event-box-module/Repositories/inbox-event.repository';
import { type ConsumeMessage } from 'amqplib';
import { validateOrRejectObject } from 'src/common/utils/app.utils';

export class RabbitMQCommonConsumer {
  constructor(private readonly inboxRep: InboxEventRepository) {}

  async handle(payload: unknown, msg: ConsumeMessage, queue: string, validateClass?: new () => any) {
    const fields = msg.fields;
    const properties = msg.properties;

    console.log('before:', payload);
    let validatedPayload = payload;
    if (validateClass) validatedPayload = await validateOrRejectObject(validateClass, payload as object);
    console.log('after:', validatedPayload);

    const existingEvent = await this.inboxRep.findUnique({ where: { messageId: properties.messageId } });
    if (existingEvent) {
      console.log(`Duplicate rmq message with messageId ${properties.messageId} found`);
      return;
    }
    await this.inboxRep.create({
      data: {
        payload: JSON.stringify(validatedPayload),
        routingKey: fields.routingKey,
        queue,
        appId: properties.appId,
        messageId: properties.messageId,
      },
    });
  }
}
