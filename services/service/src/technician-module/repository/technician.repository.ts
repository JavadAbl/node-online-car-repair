import { Injectable } from '@nestjs/common';
import { Repository } from 'src/infrastructure-modules/prsima-module/common.repository';
import { PrismaProvider } from 'src/infrastructure-modules/prsima-module/prisma.provider';

@Injectable()
export class TechnicianRepository extends Repository<'technician'> {
  constructor(prismaProvider: PrismaProvider) {
    super('technician', prismaProvider);
  }
}
