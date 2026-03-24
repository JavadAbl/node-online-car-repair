import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig, ConfigType } from 'src/common/config/config.type';
import {
  RMQ_EXCHANGE,
  RMQ_Q_AUTH_ROLE_PERMISSION_CREATE,
  RMQ_Q_AUTH_ROLE_PERMISSION_DELETE,
  RMQ_Q_AUTH_USER_CREATE,
} from './config/rmq.config';
import { RabbitMQPublisher } from './rmq-publisher.service';
import { generateQueueRetryConfig } from './rmq.utils';
import { RabbitMQEventConsumer } from './consumers/rmq-event.consumer';

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
          generateQueueRetryConfig(RMQ_Q_AUTH_USER_CREATE),
          generateQueueRetryConfig(RMQ_Q_AUTH_ROLE_PERMISSION_CREATE),
          generateQueueRetryConfig(RMQ_Q_AUTH_ROLE_PERMISSION_DELETE),
        ],
        connectionInitOptions: { wait: true },

        channels: {
          main: { prefetchCount: 10, default: true },
          [RMQ_Q_AUTH_USER_CREATE]: { prefetchCount: 10, default: false },
          [RMQ_Q_AUTH_ROLE_PERMISSION_CREATE]: { prefetchCount: 10, default: false },
          [RMQ_Q_AUTH_ROLE_PERMISSION_DELETE]: { prefetchCount: 10, default: false },
        },

        enableControllerDiscovery: true,
      }),
    }),
  ],
  providers: [RabbitMQPublisher, RabbitMQEventConsumer],
  exports: [RabbitMQPublisher],
})
export class RmqModule {}
