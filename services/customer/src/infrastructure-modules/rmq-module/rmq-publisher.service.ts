import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RMQ_EXCHANGE } from './config/rmq.config';

export class RabbitMQPublisher {
  constructor(private readonly connection: AmqpConnection) {}

  async publish<T>(routingKey: string, event: T, appId: string) {
    await this.connection.publish(RMQ_EXCHANGE, routingKey, event, { appId, persistent: true });
  }
}
