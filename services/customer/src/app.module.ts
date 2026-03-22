import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig, configValidationSchema } from './common/config/app.config';
import { CustomerModule } from './customer-module/customer.module';
import { RmqModule } from './infrastructure-modules/rmq-module/rmq.module';
import { PrismaModule } from './infrastructure-modules/prsima-module/prisma.module';
import { CronModule } from './infrastructure-modules/cron-module/cron.module';
import { QueueModule } from './infrastructure-modules/queue-module/queue.module';
import { EventBoxModule } from './infrastructure-modules/event-box-module/event-box.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guards/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true, // Allows variables not defined in schema
        abortEarly: true, // Stops validation on the first error
      },
    }),
    QueueModule,
    RmqModule,
    PrismaModule,
    CronModule,
    EventBoxModule,
    CustomerModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
