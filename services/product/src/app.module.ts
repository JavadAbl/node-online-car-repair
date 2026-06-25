import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig, configValidationSchema } from './common/config/app.config';
import { TechnicianModule } from './technician-module/technician.module';
import { ServiceModule } from './serivce-module/service.module';
import { EventBoxModule } from './infrastructure-modules/event-box-module/event-box.module';
import { RmqModule } from './infrastructure-modules/rmq-module/rmq.module';
import { PrismaModule } from './infrastructure-modules/prsima-module/prisma.module';
import { CronModule } from './infrastructure-modules/cron-module/cron.module';
import { AuthModule } from './infrastructure-modules/auth-module/auth.module';
import { QueueModule } from './infrastructure-modules/queue-module/queue.module';

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

    RmqModule,
    PrismaModule,
    EventBoxModule,
    AuthModule,
    QueueModule,
    RmqModule,
    PrismaModule,
    CronModule,
    EventBoxModule,

    TechnicianModule,
    ServiceModule,
  ],
  providers: [],
})
export class AppModule {}
