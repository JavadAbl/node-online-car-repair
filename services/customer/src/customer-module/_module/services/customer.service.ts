import { Injectable } from '@nestjs/common';
import { UpdateCustomerDto } from '../dto/request/update-customer.dto';
import { CustomerDto } from '../dto/response/customer.dto';
import { GetManyQueryType } from 'src/common/contract/query/get-many-query';
import { buildFindManyArgs } from 'src/common/utils/prisma-util';
import { CustomerRepository } from '../repository/customer.repository';
import { plainToInstance } from 'class-transformer';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  RMQ_EXCHANGE,
  RMQ_P_RK_CUSTOMER_UPDATE,
} from 'src/infrastructure-modules/rmq-module/config/rmq.config';

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerRep: CustomerRepository,
    private readonly rmq: AmqpConnection,
  ) {}

  getMany(query: GetManyQueryType<'Customers'>) {
    const predicate = buildFindManyArgs(query, { searchableFields: ['firstName', 'lastName', 'email'] });
    return this.customerRep.findMany(predicate);
  }

  async getById(id: number): Promise<CustomerDto> {
    const customer = await this.customerRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    return plainToInstance(CustomerDto, customer);
  }

  async getByMobile(mobile: string): Promise<CustomerDto> {
    const customer = await this.customerRep.findAndCheckExistsBy({ where: { mobile } }, 'mobile', mobile);
    return plainToInstance(CustomerDto, customer);
  }

  async update(id: number, payload: UpdateCustomerDto): Promise<CustomerDto> {
    await this.customerRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    const updatedCustomer = await this.customerRep.update({ where: { id }, data: payload });
    await this.rmq.publish(RMQ_EXCHANGE, RMQ_P_RK_CUSTOMER_UPDATE, updatedCustomer);
    return plainToInstance(CustomerDto, updatedCustomer);
  }

  async remove(id: number): Promise<void> {
    await this.customerRep.findAndCheckExistsBy({ where: { id } }, 'id', id);
    await this.customerRep.remove({ where: { id } });
  }
}
