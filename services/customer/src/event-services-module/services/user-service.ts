import { Injectable } from '@nestjs/common';
import { RMQ_P_RK_CUSTOMER_CREATE } from 'src/infrastructure-modules/rmq-module/config/rmq.config';
import { CustomerRepository } from 'src/customer-module/_module/repository/customer.repository';
import { UserCreate } from '../contracts/user-create';
import { RabbitMQPublisher } from 'src/infrastructure-modules/rmq-module/rmq-publisher.service';

@Injectable()
export class UserService {
  constructor(
    private readonly customerRep: CustomerRepository,
    private readonly rmqPublisher: RabbitMQPublisher,
  ) {}

  async createUser(payload: UserCreate): Promise<void> {
    const { mobile } = payload;
    await this.customerRep.checkDuplicateBy({ where: { mobile } }, 'mobile', mobile);
    const customer = await this.customerRep.create({ data: payload });
    await this.rmqPublisher.publish(RMQ_P_RK_CUSTOMER_CREATE, customer);
  }
}
