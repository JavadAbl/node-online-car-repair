import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { JOB_AUTH_USER_CREATE } from '../../queue-module/config/queue.config';
import { InboxEventRepository } from '../../event-box-module/Repositories/inbox-event.repository';
import { RMQ_Q_AUTH_USER_CREATE } from '../../rmq-module/config/rmq.config';
import { CronLockService } from '../cron-lock.service';
import { JobProvider } from 'src/infrastructure-modules/queue-module/job.provider';

@Injectable()
export class InboxEventCron {
  constructor(
    private readonly lockService: CronLockService,
    private readonly inboxRep: InboxEventRepository,
    private readonly jobProvider: JobProvider,
  ) {}

  @Interval(10000)
  async handleInboxEvents() {
    await this.lockService.runLocked(this.handleInboxEvents.name, async () => {
      const unhandledEvents = await this.inboxRep.findMany({ where: { status: 'Pending' } });

      for (const event of unhandledEvents) {
        switch (event.queue) {
          case RMQ_Q_AUTH_USER_CREATE:
            await this.jobProvider.addAuthApiJob(JOB_AUTH_USER_CREATE, event);
            break;
        }
      }

      await this.inboxRep.updateMany({ data: { status: 'InQueue' }, where: { status: 'Pending' } });
    });
  }
}
