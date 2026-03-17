import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from '../dto/request/create-service.dto';
import { ServiceDto } from '../dto/response/service.dto';
import { GetManyQueryType } from 'src/common/contract/query/get-many-query';
import { ServiceRepository } from '../repository/service.repository';
import { buildFindManyArgs } from 'src/common/utils/prisma-util';
import { plainToInstance } from 'class-transformer';
import { UpdateServiceDto } from '../dto/request/update-service.dto';
import { RabbitMQPublisher } from 'src/infrastructure-modules/rmq-module/rmq-publisher.service';
import {
  RMQ_P_RK_SERVICE_CREATE,
  RMQ_P_RK_SERVICE_UPDATE,
} from 'src/infrastructure-modules/rmq-module/config/rmq.config';

@Injectable()
export class ServiceEntityService {
  constructor(
    private readonly serviceRep: ServiceRepository,
    private readonly rmqPublisher: RabbitMQPublisher,
  ) {}

  async create(payload: CreateServiceDto): Promise<ServiceDto> {
    const { name } = payload;
    await this.serviceRep.checkDuplicateBy({ where: { name } }, 'name', name);
    const service = await this.serviceRep.create({ data: payload });
    await this.rmqPublisher.publish(RMQ_P_RK_SERVICE_CREATE, service);
    return plainToInstance(ServiceDto, service);
  }

  async getMany(query: GetManyQueryType<'Service'>): Promise<ServiceDto[]> {
    const predicate = buildFindManyArgs(query, { searchableFields: ['name'] });
    const services = await this.serviceRep.findMany(predicate);
    return plainToInstance(ServiceDto, services);
  }

  async getById(id: number): Promise<ServiceDto> {
    const service = await this.serviceRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    return plainToInstance(ServiceDto, service);
  }

  async update(id: number, payload: UpdateServiceDto): Promise<ServiceDto> {
    await this.serviceRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    const updatedService = await this.serviceRep.update({ where: { id }, data: payload });
    await this.rmqPublisher.publish(RMQ_P_RK_SERVICE_UPDATE, updatedService);
    return plainToInstance(ServiceDto, updatedService);
  }

  async remove(id: number): Promise<void> {
    await this.serviceRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    await this.serviceRep.remove({ where: { id } });
  }
}
