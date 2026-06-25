import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { GetManyQuery, GetManyQueryType } from 'src/common/dto/reqest/get-many-query';
import { ServiceEntityService } from '../services/service-entity.service';
import { CreateServiceDto } from '../dto/request/create-service.dto';
import { ServiceDto } from '../dto/response/service.dto';
import { UpdateServiceDto } from '../dto/request/update-service.dto';
import { GetManyReply } from 'src/common/dto/response/get-many-reply';

@Controller('Service')
export class ServiceController {
  constructor(private readonly serviceEntityService: ServiceEntityService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createServiceDto: CreateServiceDto): Promise<ServiceDto> {
    return this.serviceEntityService.create(createServiceDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getMany(@Query() query: GetManyQuery): Promise<GetManyReply<ServiceDto>> {
    return this.serviceEntityService.getMany(query as GetManyQueryType<'Service'>);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getById(@Param('id', ParseIntPipe) id: number): Promise<ServiceDto> {
    return this.serviceEntityService.getById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceDto> {
    return this.serviceEntityService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.serviceEntityService.remove(id);
  }
}
