import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../repository/customer.repository';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RMQ_EXCHANGE, RMQ_P_RK_CUSTOMER_CREATE } from 'src/infrastructure-modules/rmq-module/rmq.config';
import { AuthUserCreate } from 'src/infrastructure-modules/rmq-module/contracts/auth-api.contract';
import { OutboxEventRepository } from 'src/infrastructure-modules/event-box-module/Repositories/outbox-event.repository';

@Injectable()
export class CustomerEventService {
  constructor(
    private readonly customerRep: CustomerRepository,
    private readonly rmq: AmqpConnection,
    private readonly outboxRep: OutboxEventRepository,
  ) {}

  async createFromEvent(payload: AuthUserCreate): Promise<void> {
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
