import { Injectable } from '@nestjs/common';
import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  RMQ_EXCHANGE,
  RMQ_Q_AUTH_USER_CREATE,
  RMQ_Q_RK_AUTH_USER_CREATE,
} from 'src/infrastructure-modules/rmq-module/config/rmq.config';
import { InboxEventRepository } from '../../event-box-module/Repositories/inbox-event.repository';
import { type ConsumeMessage } from 'amqplib';
import { validateOrRejectObject } from 'src/common/utils/app.utils';
import { UserCreate } from 'src/event-services-module/contracts/user-create';

@Injectable()
export class RabbitMQInboxHandler {
  constructor(private readonly inboxRep: InboxEventRepository) {}

  private async handle(payload: unknown, msg: ConsumeMessage) {
    const fields = msg.fields;
    const properties = msg.properties;

    await validateOrRejectObject(UserCreate, payload as object);

    const existingEvent = await this.inboxRep.findUnique({ where: { messageId: properties.messageId } });
    if (existingEvent) {
      console.log(`Duplicate rmq message with messageId ${properties.messageId} found`);
      return;
    }
    await this.inboxRep.create({
      data: {
        payload: msg.content,
        routingKey: fields.routingKey,
        queue: RMQ_Q_AUTH_USER_CREATE,
        appId: properties.appId,
        messageId: properties.messageId,
      },
    });
  }

  @RabbitSubscribe({
    exchange: RMQ_EXCHANGE,
    queue: RMQ_Q_AUTH_USER_CREATE,
    routingKey: RMQ_Q_RK_AUTH_USER_CREATE,
    queueOptions: { channel: RMQ_Q_AUTH_USER_CREATE },
  })
  async handleUserCreate(payload: unknown, msg: ConsumeMessage) {
    try {
      await this.handle(payload, msg);
    } catch (err) {
      console.error(err);
      return new Nack(false);
    }
  }
}
