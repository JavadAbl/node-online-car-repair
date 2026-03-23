import { randomUUID } from 'crypto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RMQ_APP_ID, RMQ_EXCHANGE } from './config/rmq.config';
import { OutboxEventRepository } from '../event-box-module/Repositories/outbox-event.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RabbitMQPublisher {
  constructor(
    private readonly connection: AmqpConnection,
    private readonly outboxRep: OutboxEventRepository,
  ) {}

  async publish<T>(routingKey: string, payload: T) {
    const serializedPayload = JSON.stringify(payload);
    const messageId = randomUUID();

    await this.connection.publish(RMQ_EXCHANGE, routingKey, payload, {
      appId: RMQ_APP_ID,
      messageId,
      persistent: true,
    });
    await this.outboxRep.create({ data: { routingKey, payload: serializedPayload, messageId } });
  }

  async publishNoLog<T>(routingKey: string, payload: T) {
    const messageId = randomUUID();

    await this.connection.publish(RMQ_EXCHANGE, routingKey, payload, {
      appId: RMQ_APP_ID,
      messageId,
      persistent: true,
    });
  }
}
