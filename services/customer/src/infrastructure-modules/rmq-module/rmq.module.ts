import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig, ConfigType } from 'src/common/config/config.type';
import { RMQ_EXCHANGE, RMQ_Q_AUTH_USER_CREATE } from './rmq.config';
import { AuthApiConsumer } from './consumers/auth-api.cosumer';

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<ConfigType>) => ({
        uri: config.get<AppConfig>('app')!.RABBITMQ_URL,
        exchanges: [{ name: RMQ_EXCHANGE, type: 'direct', createExchangeIfNotExists: true }],
        connectionInitOptions: { wait: true },

        channels: {
          main: { prefetchCount: 10, default: true },
          [RMQ_Q_AUTH_USER_CREATE]: { prefetchCount: 10, default: false },
        },

        enableControllerDiscovery: true,
      }),
    }),
  ],
  providers: [AuthApiConsumer],
  exports: [RabbitMQModule],
})
export class RmqModule {}
