import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import {
  RMQ_EXCHANGE,
  RMQ_P_RK_CUSTOMER_CREATE,
} from 'src/infrastructure-modules/rmq-module/config/rmq.config';
import { OutboxEventRepository } from 'src/infrastructure-modules/event-box-module/Repositories/outbox-event.repository';
import { CustomerRepository } from 'src/customer-module/_module/repository/customer.repository';
import { UserCreate } from '../contracts/user-create';

@Injectable()
export class UserService {
  constructor(
    private readonly customerRep: CustomerRepository,
    private readonly rmq: AmqpConnection,
    private readonly outboxRep: OutboxEventRepository,
  ) {}

  async createUser(payload: UserCreate): Promise<void> {
    const { mobile } = payload;
    await this.customerRep.checkDuplicateBy({ where: { mobile } }, 'mobile', mobile);
    const customer = await this.customerRep.create({ data: payload });
    const customerSerialized = JSON.stringify(customer);
    await this.rmq.publish(RMQ_EXCHANGE, RMQ_P_RK_CUSTOMER_CREATE, customerSerialized);
    await this.outboxRep.create({
      data: { routingKey: RMQ_P_RK_CUSTOMER_CREATE, payload: customerSerialized },
    });
  }
}
