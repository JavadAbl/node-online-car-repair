import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from '../dto/request/create-service.dto';
import { ServiceDto } from '../dto/response/service.dto';
import { GetManyQueryType } from 'src/common/contract/query/get-many-query';
import { ServiceRepository } from '../repository/service.repository';
import { buildFindManyArgs } from 'src/common/utils/prisma-util';
import { plainToInstance } from 'class-transformer';
import { UpdateServiceDto } from '../dto/request/update-service.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  RMQ_EXCHANGE,
  RMQ_P_RK_SERVICE_CREATE,
  RMQ_P_RK_SERVICE_UPDATE,
} from 'src/infrastructure-modules/rmq-module/rmq.config';
import { OutboxEventRepository } from 'src/infrastructure-modules/event-box-module/Repositories/outbox-event.repository';

@Injectable()
export class ServiceEntityService {
  constructor(
    private readonly serviceRep: ServiceRepository,
    private readonly rmq: AmqpConnection,
    private readonly outboxRep: OutboxEventRepository,
  ) {}

  async create(payload: CreateServiceDto): Promise<ServiceDto> {
    const { name } = payload;
    await this.serviceRep.checkDuplicateBy({ where: { name } }, 'name', name);
    const service = await this.serviceRep.create({ data: payload });

    const serviceSerialized = JSON.stringify(service);
    await this.rmq.publish(RMQ_EXCHANGE, RMQ_P_RK_SERVICE_CREATE, serviceSerialized);
    await this.outboxRep.create({
      data: { routingKey: RMQ_P_RK_SERVICE_CREATE, payload: serviceSerialized },
    });
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
    const updatedServiceSerialized = JSON.stringify(updatedService);
    await this.rmq.publish(RMQ_EXCHANGE, RMQ_P_RK_SERVICE_UPDATE, updatedServiceSerialized);
    await this.outboxRep.create({
      data: { routingKey: RMQ_P_RK_SERVICE_UPDATE, payload: updatedServiceSerialized },
    });
    return plainToInstance(ServiceDto, updatedService);
  }

  async remove(id: number): Promise<void> {
    await this.serviceRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    await this.serviceRep.remove({ where: { id } });
  }
}
