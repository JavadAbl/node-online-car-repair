import { Injectable } from '@nestjs/common';
import { Repository } from 'src/infrastructure-modules/prsima-module/common.repository';
import { PrismaProvider } from 'src/infrastructure-modules/prsima-module/prisma.provider';

@Injectable()
export class OutboxEventRepository extends Repository<'outboxEvent'> {
  constructor(prismaProvider: PrismaProvider) {
    super('outboxEvent', prismaProvider);
  }
}
