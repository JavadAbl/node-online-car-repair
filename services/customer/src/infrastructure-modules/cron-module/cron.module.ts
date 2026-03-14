import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { InboxEventCron } from './crons/inbox-event.cron';

@Module({ imports: [ScheduleModule.forRoot()], providers: [InboxEventCron] })
export class CronModule {}
