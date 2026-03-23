// jobs.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { type Job } from 'bull';
import {
  JOB_AUTH_ROLE_PERMISSION_CREATE,
  JOB_AUTH_USER_CREATE,
  QUEUE_AUTH_API,
} from '../config/queue.config';
import { InboxEventRepository } from '../../event-box-module/Repositories/inbox-event.repository';
import { InboxEvent } from 'src/generated/prisma/client';
import { CustomerService } from 'src/customer-module/_module/services/customer.service';
import { AuthService } from 'src/infrastructure-modules/auth-module/auth.service';
import { RolePermissionCreateEvent } from 'src/infrastructure-modules/rmq-module/contracts/role-permission-event';
import { UserCreateEvent } from 'src/infrastructure-modules/rmq-module/contracts/user-create-event';

@Processor(QUEUE_AUTH_API)
export class AuthApiJobWorker {
  constructor(
    private readonly inboxRep: InboxEventRepository,
    private readonly customerService: CustomerService,
    private readonly authService: AuthService,
  ) {}

  @Process(JOB_AUTH_USER_CREATE)
  async handleAuthUserCreate(job: Job<InboxEvent>) {
    const { id, payload } = job.data;
    try {
      const parsedPayload: UserCreateEvent = JSON.parse(payload as string);
      await this.customerService.createUser(parsedPayload);
      await this.inboxRep.update({ where: { id }, data: { status: 'Handled', handledAt: new Date() } });
    } catch (error) {
      console.error(error);
      await this.inboxRep.update({ where: { id }, data: { status: 'Error' } });
    }
  }

  @Process(JOB_AUTH_ROLE_PERMISSION_CREATE)
  async handleAuthRolePermissionCreate(job: Job<InboxEvent>) {
    const { id, payload } = job.data;
    try {
      const parsedPayload: RolePermissionCreateEvent = JSON.parse(payload as string);
      await this.authService.createRolePermissions(parsedPayload);
      await this.inboxRep.update({ where: { id }, data: { status: 'Handled', handledAt: new Date() } });
    } catch (error) {
      console.error(error);
      await this.inboxRep.update({ where: { id }, data: { status: 'Error' } });
    }
  }
}
