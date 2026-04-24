import { Injectable } from '@nestjs/common';
import { CreateTechnicianDto } from '../dto/request/create-technician.dto';
import { UpdateTechnicianDto } from '../dto/request/update-technician.dto';
import { TechnicianDto } from '../dto/response/technician.dto';
import { GetManyQueryType } from 'src/common/contract/query/get-many-query';
import { TechnicianRepository } from '../repository/technician.repository';
import { buildFindManyArgs } from 'src/common/utils/prisma-util';
import { plainToInstance } from 'class-transformer';
import { RabbitMQPublisher } from 'src/infrastructure-modules/rmq-module/rmq-publisher.service';
import {
  RMQ_P_RK_SERVICE_CREATE,
  RMQ_P_RK_SERVICE_UPDATE,
} from 'src/infrastructure-modules/rmq-module/config/rmq.config';

@Injectable()
export class TechnicianService {
  constructor(
    private readonly technicianRep: TechnicianRepository,
    private readonly rmqPublisher: RabbitMQPublisher,
  ) {}

  async create(payload: CreateTechnicianDto): Promise<TechnicianDto> {
    const { employeeNumber } = payload;
    await this.technicianRep.checkDuplicateBy(
      { where: { employeeNumber } },
      'employeeNumber',
      employeeNumber,
    );
    const technician = await this.technicianRep.create({ data: payload });
    await this.rmqPublisher.publish(RMQ_P_RK_SERVICE_CREATE, technician);
    return plainToInstance(TechnicianDto, technician);
  }

  async findMany(query: GetManyQueryType<'Technician'>): Promise<TechnicianDto[]> {
    const predicate = buildFindManyArgs(query, { searchableFields: ['firstName', 'lastName'] });
    const technicians = await this.technicianRep.findMany(predicate);
    return plainToInstance(TechnicianDto, technicians);
  }

  async getById(id: number): Promise<TechnicianDto> {
    const technician = await this.technicianRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    return plainToInstance(TechnicianDto, technician);
  }

  async update(id: number, payload: UpdateTechnicianDto): Promise<TechnicianDto> {
    await this.technicianRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    const updatedTechnician = await this.technicianRep.update({ where: { id }, data: payload });
    await this.rmqPublisher.publish(RMQ_P_RK_SERVICE_UPDATE, updatedTechnician);
    return plainToInstance(TechnicianDto, updatedTechnician);
  }

  async remove(id: number): Promise<void> {
    await this.technicianRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    await this.technicianRep.remove({ where: { id } });
  }

  async setTechnicianImageSrc(id: number, src: string) {
    await this.technicianRep.update({ where: { id }, data: { image: src } });
  }
}
