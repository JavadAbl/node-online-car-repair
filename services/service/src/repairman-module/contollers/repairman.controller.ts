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
  Req,
  BadRequestException,
} from '@nestjs/common';
import { RepairmanService } from '../services/repairman.service';
import { GetManyQuery, GetManyQueryType } from 'src/common/contract/query/get-many-query';
import { CreateRepairmanDto } from '../dto/request/create-repairman.dto';
import { UpdateRepairmanDto } from '../dto/request/update-repairman.dto';
import { RepairmanDto } from '../dto/response/repairman.dto';
import { type FastifyRequest } from 'fastify';
import { pipeline } from 'stream/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';

@Controller('Repairmans')
export class RepairmanController {
  constructor(private readonly repairmanService: RepairmanService) {}

  @Get()
  getManyRepairman(@Query() query: GetManyQuery): Promise<RepairmanDto[]> {
    return this.repairmanService.findMany(query as GetManyQueryType<'Repairman'>);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<RepairmanDto> {
    return this.repairmanService.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRepairmanDto: CreateRepairmanDto): Promise<RepairmanDto> {
    return this.repairmanService.create(createRepairmanDto);
  }

  @Put(':id')
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

  @Post(':id/SetImage')
  @HttpCode(HttpStatus.CREATED)
  async setImage(@Param('id', ParseIntPipe) id: number, @Req() req: FastifyRequest): Promise<void> {
    const data = await req.file();

    if (!data) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(data.mimetype)) {
      throw new BadRequestException('Only JPG and PNG files are allowed');
    }
    const originalExt = (data.filename || '').toLowerCase().match(/\.[^.]+$/)?.[0];
    const ext = originalExt ?? (data.mimetype === 'image/png' ? '.png' : '.jpg');

    // Ensure upload folder exists
    const uploadDir = path.join(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Generate filename: image_<id>_<YYYY-MM-DD_HH-mm-ss>.ext
    // const now = new Date();
    // const timestamp = now.toISOString().replace(/[:]/g, '-').replace(/\..+/, ''); // "2026-04-21T14-25-30"

    const safeFilename = `repairman_${id}${ext}`;
    // const safeFilename = `image_${id}_${timestamp}${ext}`;
    const filePath = path.join(uploadDir, safeFilename);

    await pipeline(data.file, createWriteStream(filePath));

    const src = `https://localhost:3000/Service-Api/uploads/${safeFilename}`;
    await this.repairmanService.setRepairmanImageSrc(id, src);
  }
}
