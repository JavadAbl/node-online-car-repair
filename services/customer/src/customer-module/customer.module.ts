import { Module } from '@nestjs/common';
import { CustomerController } from './_module/controllers/customer.controller';
import { CustomerService } from './_module/services/customer.service';
import { CustomerRepository } from './_module/repository/customer.repository';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, CustomerRepository],
  exports: [CustomerRepository],
})
export class CustomerModule {}
