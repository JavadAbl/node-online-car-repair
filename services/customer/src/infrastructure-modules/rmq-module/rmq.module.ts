import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig, ConfigType } from 'src/common/config/config.type';
import {
  RMQ_EXCHANGE,
  RMQ_Q_AUTH_ROLE_PERMISSION_CREATE,
  RMQ_Q_AUTH_ROLE_PERMISSION_CREATE_DLQ,
  RMQ_Q_AUTH_ROLE_PERMISSION_CREATE_RETRY,
  RMQ_Q_AUTH_ROLE_PERMISSION_CREATE_RETRY_RK,
  RMQ_Q_AUTH_USER_CREATE,
  RMQ_Q_AUTH_USER_CREATE_DLQ,
  RMQ_Q_AUTH_USER_CREATE_RETRY,
  RMQ_Q_AUTH_USER_CREATE_RETRY_RK,
} from './config/rmq.config';
import { RabbitMQPublisher } from './rmq-publisher.service';
import { RabbitMQInboxConsumer } from './consumers/rmq-inbox.consumer';
import { RabbitMQAuthConsumer } from './consumers/rmq-auth.consumer';

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<ConfigType>) => ({
        uri: config.get<AppConfig>('app')!.RABBITMQ_URL,
        exchanges: [{ name: RMQ_EXCHANGE, type: 'direct', createExchangeIfNotExists: true }],
        queues: [
          {
            exchange: RMQ_EXCHANGE,
            name: RMQ_Q_AUTH_USER_CREATE_RETRY,
            routingKey: [RMQ_Q_AUTH_USER_CREATE_RETRY_RK],
            options: {
              deadLetterExchange: RMQ_EXCHANGE,
              deadLetterRoutingKey: RMQ_Q_AUTH_USER_CREATE_DLQ,
              messageTtl: 60000,
            },
          },

          {
            exchange: RMQ_EXCHANGE,
            name: RMQ_Q_AUTH_ROLE_PERMISSION_CREATE_RETRY,
            routingKey: [RMQ_Q_AUTH_ROLE_PERMISSION_CREATE_RETRY_RK],
            options: {
              deadLetterExchange: RMQ_EXCHANGE,
              deadLetterRoutingKey: RMQ_Q_AUTH_ROLE_PERMISSION_CREATE_DLQ,
              messageTtl: 60000,
            },
          },
        ],
        connectionInitOptions: { wait: true },

        channels: {
          main: { prefetchCount: 10, default: true },
          [RMQ_Q_AUTH_USER_CREATE]: { prefetchCount: 10, default: false },
          [RMQ_Q_AUTH_ROLE_PERMISSION_CREATE]: { prefetchCount: 10, default: false },
        },

        enableControllerDiscovery: true,
      }),
    }),
  ],
  providers: [RabbitMQPublisher, RabbitMQInboxConsumer, RabbitMQAuthConsumer],
  exports: [RabbitMQPublisher],
})
export class RmqModule {}
