import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  RMQ_EXCHANGE,
  RMQ_Q_AUTH_USER_CREATE,
  RMQ_Q_RK_AUTH_USER_CREATE,
} from 'src/infrastructure-modules/rmq-module/rmq.config';
import { type AuthUserCreate } from '../contracts/auth-api.contract';
import { InboxEventRepository } from '../../event-box-module/Repositories/inbox-event.repository';
import { apiConsumer } from './api.consumer';

@Injectable()
export class AuthApiConsumer {
  constructor(private readonly inboxRep: InboxEventRepository) {}

  @RabbitSubscribe({
    exchange: RMQ_EXCHANGE,
    queue: RMQ_Q_AUTH_USER_CREATE,
    routingKey: RMQ_Q_RK_AUTH_USER_CREATE,
    queueOptions: { channel: RMQ_Q_AUTH_USER_CREATE },
  })
  async create(payload: AuthUserCreate): Promise<void> {
    await apiConsumer(
      this.inboxRep,
      RMQ_Q_AUTH_USER_CREATE,
      RMQ_Q_RK_AUTH_USER_CREATE,
      'auth',
      JSON.stringify(payload),
    );
  }
}
