import { Injectable } from '@nestjs/common';
import { InboxEventRepository } from '../../event-box-module/Repositories/inbox-event.repository';

@Injectable()
export class AuthApiConsumer {
  constructor(private readonly inboxRep: InboxEventRepository) {}
}
