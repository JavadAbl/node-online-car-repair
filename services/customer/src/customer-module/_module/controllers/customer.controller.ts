import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { UpdateCustomerDto } from '../dto/request/update-customer.dto';
import { CustomerDto } from '../dto/response/customer.dto';
import { GetManyQuery, GetManyQueryType } from 'src/common/contract/query/get-many-query';
import { Auth } from 'src/common/decorators/auth.decorator';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Auth(CustomerController.name, CustomerController.prototype.getManyCustomers.name)
  @Get()
  getManyCustomers(@Query() query: GetManyQuery): Promise<CustomerDto[]> {
    return this.customerService.getMany(query as GetManyQueryType<'Customers'>);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<CustomerDto> {
    return this.customerService.getById(id);
  }

  @Get('mobile/:mobile')
  async getByMobile(@Param('mobile') mobile: string): Promise<CustomerDto> {
    return this.customerService.getByMobile(mobile);
  }

  @Put(':id')
  async update(
    @Param(ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerDto> {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param(ParseIntPipe) id: number): Promise<void> {
    return this.customerService.remove(id);
  }
}
