import { Injectable } from '@nestjs/common';
import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  RMQ_EXCHANGE,
  RMQ_Q_AUTH_ROLE_PERMISSION_CREATE,
  RMQ_Q_AUTH_ROLE_PERMISSION_CREATE_DLQ,
  RMQ_Q_AUTH_ROLE_PERMISSION_CREATE_RETRY_RK,
  RMQ_Q_RK_AUTH_ROLE_PERMISSION_CREATE,
} from 'src/infrastructure-modules/rmq-module/config/rmq.config';
import { type ConsumeMessage } from 'amqplib';
import { RabbitMQCommonConsumer } from './rmq-common.consumer';
import { InboxEventRepository } from 'src/infrastructure-modules/event-box-module/Repositories/inbox-event.repository';
import { RolePermissionCreateEvent } from '../contracts/role-permission-event';

@Injectable()
export class RabbitMQAuthConsumer extends RabbitMQCommonConsumer {
  constructor(inboxRep: InboxEventRepository) {
    super(inboxRep);
  }

  @RabbitSubscribe({
    exchange: RMQ_EXCHANGE,
    queue: RMQ_Q_AUTH_ROLE_PERMISSION_CREATE,
    routingKey: [RMQ_Q_RK_AUTH_ROLE_PERMISSION_CREATE, RMQ_Q_AUTH_ROLE_PERMISSION_CREATE_DLQ],
    queueOptions: {
      channel: RMQ_Q_AUTH_ROLE_PERMISSION_CREATE,
      deadLetterExchange: RMQ_EXCHANGE,
      deadLetterRoutingKey: RMQ_Q_AUTH_ROLE_PERMISSION_CREATE_RETRY_RK,
    },
  })
  async handleRolePermissionCreate(payload: unknown, msg: ConsumeMessage) {
    try {
      await this.handle(payload, msg, RMQ_Q_AUTH_ROLE_PERMISSION_CREATE, RolePermissionCreateEvent);
    } catch (err) {
      console.error(err);
      return new Nack(false);
    }
  }
}
