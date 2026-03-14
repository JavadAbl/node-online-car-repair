import { Module } from '@nestjs/common';
import { CustomerController } from './_module/controllers/customer.controller';
import { CustomerService } from './_module/services/customer.service';
import { CustomerRepository } from './_module/repository/customer.repository';
import { CustomerEventService } from './_module/services/customer-event.service';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, CustomerRepository, CustomerEventService],
  exports: [CustomerEventService],
})
export class CustomerModule {}
