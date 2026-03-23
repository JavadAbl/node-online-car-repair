import { Injectable } from '@nestjs/common';
import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  RMQ_EXCHANGE,
  RMQ_Q_AUTH_USER_CREATE,
  RMQ_Q_AUTH_USER_CREATE_DLQ,
  RMQ_Q_AUTH_USER_CREATE_RETRY_RK,
  RMQ_Q_RK_AUTH_USER_CREATE,
} from 'src/infrastructure-modules/rmq-module/config/rmq.config';
import { InboxEventRepository } from '../../event-box-module/Repositories/inbox-event.repository';
import { type ConsumeMessage } from 'amqplib';
import { validateOrRejectObject } from 'src/common/utils/app.utils';
import { UserCreateEvent } from '../contracts/user-create-event';

@Injectable()
export class RabbitMQInboxConsumer {
  constructor(private readonly inboxRep: InboxEventRepository) {}

  private async handle(payload: unknown, msg: ConsumeMessage, queue: string) {
    const fields = msg.fields;
    const properties = msg.properties;

    console.log('before:', payload);
    const validatedPayload = await validateOrRejectObject(UserCreateEvent, payload as object);
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

  @RabbitSubscribe({
    exchange: RMQ_EXCHANGE,
    queue: RMQ_Q_AUTH_USER_CREATE,
    routingKey: [RMQ_Q_RK_AUTH_USER_CREATE, RMQ_Q_AUTH_USER_CREATE_DLQ],
    queueOptions: {
      channel: RMQ_Q_AUTH_USER_CREATE,
      deadLetterExchange: RMQ_EXCHANGE,
      deadLetterRoutingKey: RMQ_Q_AUTH_USER_CREATE_RETRY_RK,
    },
  })
  async handleUserCreate(payload: unknown, msg: ConsumeMessage) {
    try {
      throw new Error('test');
      await this.handle(payload, msg, RMQ_Q_AUTH_USER_CREATE);
    } catch (err) {
      console.error(err);
      return new Nack(false);
      return msg;
    }
  }
}
