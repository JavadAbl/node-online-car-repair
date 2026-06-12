import { Module } from '@nestjs/common';
import { TechnicianController } from './contollers/technician.controller';
import { TechnicianService } from './services/technician.service';
import { TechnicianRepository } from './repository/technician.repository';

@Module({ controllers: [TechnicianController], providers: [TechnicianService, TechnicianRepository] })
export class TechnicianModule {}
