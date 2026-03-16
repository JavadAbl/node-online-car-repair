// jobs.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { type Job } from 'bull';
import { JOB_AUTH_USER_CREATE, QUEUE_AUTH_API } from '../config/queue.config';
import { InboxEventRepository } from '../../event-box-module/Repositories/inbox-event.repository';
import { InboxEvent } from 'src/generated/prisma/client';
import { UserService } from 'src/event-services-module/services/user-service';

@Processor(QUEUE_AUTH_API)
export class AuthApiJobWorker {
  constructor(
    private readonly inboxRep: InboxEventRepository,
    private readonly userService: UserService,
  ) {}

  @Process(JOB_AUTH_USER_CREATE)
  async handleAuthUserCreate(job: Job<InboxEvent>) {
    const { id, payload } = job.data;
    try {
      const parsedPayload = JSON.parse(payload as string);
      await this.userService.createUser(parsedPayload);
      await this.inboxRep.update({ where: { id }, data: { status: 'Handled', handledAt: new Date() } });
    } catch (error) {
      console.error(error);
      await this.inboxRep.update({ where: { id }, data: { status: 'Error' } });
    }
  }
}
