import { Injectable } from '@nestjs/common';
import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  RMQ_Q_AUTH_ROLE_PERMISSION_CREATE,
  RMQ_Q_AUTH_ROLE_PERMISSION_DELETE,
  RMQ_Q_AUTH_USER_CREATE,
  RMQ_Q_RK_AUTH_ROLE_PERMISSION_CREATE,
  RMQ_Q_RK_AUTH_ROLE_PERMISSION_DELETE,
  RMQ_Q_RK_AUTH_USER_CREATE,
} from 'src/infrastructure-modules/rmq-module/config/rmq.config';
import { type ConsumeMessage } from 'amqplib';
import { RabbitMQCommonConsumer } from './rmq-common.consumer';
import { InboxEventRepository } from 'src/infrastructure-modules/event-box-module/Repositories/inbox-event.repository';
import { RolePermissionCreateEvent } from '../contracts/role-permission-create-event';
import { generateQueueConfig, generateQueueDLQ } from '../rmq.utils';
import { RolePermissionDeleteEvent } from '../contracts/role-permission-delete-event';

@Injectable()
export class RabbitMQEventConsumer extends RabbitMQCommonConsumer {
  constructor(inboxRep: InboxEventRepository) {
    super(inboxRep);
  }

  @RabbitSubscribe(
    generateQueueConfig(RMQ_Q_AUTH_USER_CREATE, [
      RMQ_Q_RK_AUTH_USER_CREATE,
      generateQueueDLQ(RMQ_Q_AUTH_USER_CREATE),
    ]),
  )
  async handleUserCreate(payload: unknown, msg: ConsumeMessage) {
    try {
      await this.handle(payload, msg, RMQ_Q_AUTH_USER_CREATE);
    } catch (err) {
      console.error(err);
      return new Nack(false);
    }
  }

  @RabbitSubscribe(
    generateQueueConfig(RMQ_Q_AUTH_ROLE_PERMISSION_CREATE, [
      RMQ_Q_RK_AUTH_ROLE_PERMISSION_CREATE,
      generateQueueDLQ(RMQ_Q_AUTH_ROLE_PERMISSION_CREATE),
    ]),
  )
  async handleRolePermissionCreate(payload: unknown, msg: ConsumeMessage) {
    try {
      await this.handle(payload, msg, RMQ_Q_AUTH_ROLE_PERMISSION_CREATE, RolePermissionCreateEvent);
    } catch (err) {
      console.error(err);
      return new Nack(false);
    }
  }

  @RabbitSubscribe(
    generateQueueConfig(RMQ_Q_AUTH_ROLE_PERMISSION_DELETE, [
      RMQ_Q_RK_AUTH_ROLE_PERMISSION_DELETE,
      generateQueueDLQ(RMQ_Q_AUTH_ROLE_PERMISSION_DELETE),
    ]),
  )
  async handleRolePermissionDelete(payload: unknown, msg: ConsumeMessage) {
    try {
      await this.handle(payload, msg, RMQ_Q_AUTH_ROLE_PERMISSION_DELETE, RolePermissionDeleteEvent);
    } catch (err) {
      console.error(err);
      return new Nack(false);
    }
  }
}
