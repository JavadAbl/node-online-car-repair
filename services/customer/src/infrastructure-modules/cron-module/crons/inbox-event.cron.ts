import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { AuthApiJobProvider } from '../../queue-module/job-providers/auth-api-job.provider';
import { JOB_AUTH_USER_CREATE } from '../../queue-module/queue.config';
import { InboxEventRepository } from '../../event-box-module/Repositories/inbox-event.repository';
import { RMQ_Q_AUTH_USER_CREATE } from '../../rmq-module/rmq.config';

@Injectable()
export class InboxEventCron {
  constructor(
    private readonly inboxRep: InboxEventRepository,
    private readonly authApiJobProvider: AuthApiJobProvider,
  ) {}

  @Interval(10000)
  async queueRmqUnhandledEvents() {
    try {
      const unhandledEvents = await this.inboxRep.findMany({ where: { status: 'Pending' } });

      for (const event of unhandledEvents) {
        switch (event.queue) {
          case RMQ_Q_AUTH_USER_CREATE:
            await this.authApiJobProvider.addJob(JOB_AUTH_USER_CREATE, event);
            break;
        }
      }

      await this.inboxRep.updateMany({ data: { status: 'InQueue' }, where: { status: 'Pending' } });
    } catch (error) {
      console.error(error);
    }
  }
}
