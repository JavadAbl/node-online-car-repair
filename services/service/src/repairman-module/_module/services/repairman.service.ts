import { Injectable } from '@nestjs/common';
import { CreateRepairmanDto } from '../dto/request/create-repairman.dto';
import { UpdateRepairmanDto } from '../dto/request/update-repairman.dto';
import { RepairmanDto } from '../dto/response/repairman.dto';
import { GetManyQueryType } from 'src/common/contract/query/get-many-query';
import { RepairmanRepository } from '../repository/repairman.repository';
import { buildFindManyArgs } from 'src/common/utils/prisma-util';
import { plainToInstance } from 'class-transformer';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { OutboxEventRepository } from 'src/infrastructure-modules/event-box-module/Repositories/outbox-event.repository';
import {
  RMQ_EXCHANGE,
  RMQ_P_RK_REPAIRMAN_CREATE,
  RMQ_P_RK_REPAIRMAN_UPDATE,
} from 'src/infrastructure-modules/rmq-module/rmq.config';

@Injectable()
export class RepairmanService {
  constructor(
    private readonly repairmanRep: RepairmanRepository,
    private readonly rmq: AmqpConnection,
    private readonly outboxRep: OutboxEventRepository,
  ) {}

  async create(payload: CreateRepairmanDto): Promise<RepairmanDto> {
    const { employeeNumber } = payload;
    await this.repairmanRep.checkDuplicateBy({ where: { employeeNumber } }, 'employeeNumber', employeeNumber);
    const repairman = await this.repairmanRep.create({ data: payload });

    const repairmanSerialized = JSON.stringify(repairman);
    await this.rmq.publish(RMQ_EXCHANGE, RMQ_P_RK_REPAIRMAN_CREATE, repairmanSerialized);
    await this.outboxRep.create({
      data: { routingKey: RMQ_P_RK_REPAIRMAN_CREATE, payload: repairmanSerialized },
    });
    return plainToInstance(RepairmanDto, repairman);
  }

  async findMany(query: GetManyQueryType<'Repairman'>): Promise<RepairmanDto[]> {
    const predicate = buildFindManyArgs(query, { searchableFields: ['firstName', 'lastName'] });
    const repairmans = await this.repairmanRep.findMany(predicate);
    return plainToInstance(RepairmanDto, repairmans);
  }

  async getById(id: number): Promise<RepairmanDto> {
    const repairman = await this.repairmanRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    return plainToInstance(RepairmanDto, repairman);
  }

  async update(id: number, payload: UpdateRepairmanDto): Promise<RepairmanDto> {
    await this.repairmanRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    const updatedRepairman = await this.repairmanRep.update({ where: { id }, data: payload });

    const updatedRepairmanSerialized = JSON.stringify(updatedRepairman);
    await this.rmq.publish(RMQ_EXCHANGE, RMQ_P_RK_REPAIRMAN_UPDATE, updatedRepairmanSerialized);
    await this.outboxRep.create({
      data: { routingKey: RMQ_P_RK_REPAIRMAN_UPDATE, payload: updatedRepairmanSerialized },
    });
    return plainToInstance(RepairmanDto, updatedRepairman);
  }

  async remove(id: number): Promise<void> {
    await this.repairmanRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    await this.repairmanRep.remove({ where: { id } });
  }
}
