import { Injectable } from '@nestjs/common';
import { Repository } from 'src/infrastructure-modules/prsima-module/common.repository';
import { PrismaProvider } from 'src/infrastructure-modules/prsima-module/prisma.provider';

@Injectable()
export class CustomerRepository extends Repository<'customers'> {
  constructor(prismaProvider: PrismaProvider) {
    super('customers', prismaProvider);
  }
}
