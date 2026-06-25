import { Injectable } from '@nestjs/common';
import { Repository } from 'src/infrastructure-modules/prsima-module/common.repository';
import { PrismaProvider } from 'src/infrastructure-modules/prsima-module/prisma.provider';

@Injectable()
export class ServiceRepository extends Repository<'service'> {
  constructor(prismaProvider: PrismaProvider) {
    super('service', prismaProvider);
  }
}
