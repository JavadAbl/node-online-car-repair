// jobs.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { type Job } from 'bull';
import { JOB_AUTH_USER_CREATE, QUEUE_AUTH_API } from '../queue.config';
import { CustomerEventService } from 'src/customer-module/_module/services/customer-event.service';
import { InboxEventRepository } from '../../event-box-module/Repositories/inbox-event.repository';
import { InboxEvent } from 'src/generated/prisma/client';

@Processor(QUEUE_AUTH_API)
export class AuthApiJobWorker {
  constructor(
    private readonly inboxRep: InboxEventRepository,
    private readonly customerEventService: CustomerEventService,
  ) {}

  @Process(JOB_AUTH_USER_CREATE)
  async handleAuthUserCreate(job: Job<InboxEvent>) {
    const { id, payload } = job.data;
    try {
      const parsedPayload = JSON.parse(payload as string);
      await this.customerEventService.createFromEvent(parsedPayload);
      await this.inboxRep.update({ where: { id }, data: { status: 'Handled', handledAt: new Date() } });
    } catch (error) {
      console.error(error);
      await this.inboxRep.update({ where: { id }, data: { status: 'Error' } });
    }
  }
}
