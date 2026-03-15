import { Injectable } from '@nestjs/common';
import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  RMQ_EXCHANGE,
  RMQ_Q_AUTH_USER_CREATE,
  RMQ_Q_RK_AUTH_USER_CREATE,
} from 'src/infrastructure-modules/rmq-module/config/rmq.config';
import { type AuthUserCreate } from '../contracts/auth-api.contract';
import { InboxEventRepository } from '../../event-box-module/Repositories/inbox-event.repository';
import { type ConsumeMessage } from 'amqplib';

@Injectable()
export class RabbitMQInboxHandler {
  constructor(private readonly inboxRep: InboxEventRepository) {}

  @RabbitSubscribe({
    exchange: RMQ_EXCHANGE,
    queue: RMQ_Q_AUTH_USER_CREATE,
    routingKey: RMQ_Q_RK_AUTH_USER_CREATE,
    queueOptions: { channel: RMQ_Q_AUTH_USER_CREATE },
  })
  async handle(payload: AuthUserCreate, msg: ConsumeMessage) {
    try {
      const fields = msg.fields;
      const properties = msg.properties;

      const existingEvent = await this.inboxRep.findUnique({ where: { messageId: properties.messageId } });
      if (existingEvent) {
        console.log(`Duplicate rmq message with messageId ${properties.messageId} found`);
        return;
      }
      await this.inboxRep.create({
        data: {
          payload: JSON.stringify(payload),
          routingKey: fields.routingKey,
          queue: RMQ_Q_AUTH_USER_CREATE,
          appId: properties.appId,
          messageId: properties.messageId,
        },
      });
    } catch (err) {
      console.error(err);
      return new Nack(false);
    }
  }
}
