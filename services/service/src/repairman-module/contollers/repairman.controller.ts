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
import { RepairmanService } from '../services/repairman.service';
import { GetManyQuery, GetManyQueryType } from 'src/common/contract/query/get-many-query';
import { CreateRepairmanDto } from '../dto/request/create-repairman.dto';
import { UpdateRepairmanDto } from '../dto/request/update-repairman.dto';
import { RepairmanDto } from '../dto/response/repairman.dto';

@Controller('Repairman')
export class RepairmanController {
  constructor(private readonly repairmanService: RepairmanService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRepairmanDto: CreateRepairmanDto): Promise<RepairmanDto> {
    return this.repairmanService.create(createRepairmanDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getManyRepairman(@Query() query: GetManyQuery): Promise<RepairmanDto[]> {
    return this.repairmanService.findMany(query as GetManyQueryType<'Repairman'>);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getById(@Param('id', ParseIntPipe) id: number): Promise<RepairmanDto> {
    return this.repairmanService.getById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRepairmanDto: UpdateRepairmanDto,
  ): Promise<RepairmanDto> {
    return this.repairmanService.update(id, updateRepairmanDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.repairmanService.remove(id);
  }
}
