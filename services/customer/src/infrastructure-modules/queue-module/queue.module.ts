import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig, ConfigType } from 'src/common/config/config.type';
import { QUEUE_AUTH_API } from './config/queue.config';
import { AuthApiJobWorker } from './job-workers/auth-api.worker';
import { JobProvider } from './job.provider';
import { CustomerModule } from 'src/customer-module/customer.module';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<ConfigType>) => {
        const appConfig = config.get<AppConfig>('app')!;
        return {
          redis: {
            host: appConfig.REDIS_HOST,
            port: appConfig.REDIS_PORT,
            password: appConfig.REDIS_PASSWORD,
          },
        };
      },
    }),
    BullModule.registerQueue({ name: QUEUE_AUTH_API }),
    CustomerModule,
  ],
  providers: [JobProvider, AuthApiJobWorker],
  exports: [JobProvider],
})
export class QueueModule {}
