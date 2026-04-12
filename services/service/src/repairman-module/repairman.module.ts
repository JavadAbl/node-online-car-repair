import { Module } from '@nestjs/common';
import { RepairmanController } from './contollers/repairman.controller';
import { RepairmanService } from './services/repairman.service';
import { RepairmanRepository } from './repository/repairman.repository';

@Module({ controllers: [RepairmanController], providers: [RepairmanService, RepairmanRepository] })
export class RepairmanModule {}
