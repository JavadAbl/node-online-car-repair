import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig, configValidationSchema } from './common/config/app.config';
import { RepairmanModule } from './repairman-module/repairman.module';
import { ServiceModule } from './serivce-module/service.module';
import { EventBoxModule } from './infrastructure-modules/event-box-module/event-box.module';
import { RmqModule } from './infrastructure-modules/rmq-module/rmq.module';
import { PrismaModule } from './infrastructure-modules/prsima-module/prisma.module';

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

    RepairmanModule,
    ServiceModule,
  ],
  providers: [],
})
export class AppModule {}
