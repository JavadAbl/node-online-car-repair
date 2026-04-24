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
import { TechnicianService } from '../services/technician.service';
import { GetManyQuery, GetManyQueryType } from 'src/common/contract/query/get-many-query';
import { CreateTechnicianDto } from '../dto/request/create-technician.dto';
import { UpdateTechnicianDto } from '../dto/request/update-technician.dto';
import { TechnicianDto } from '../dto/response/technician.dto';
import { type FastifyRequest } from 'fastify';
import { pipeline } from 'stream/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';

@Controller('Technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Get()
  getManyTechnician(@Query() query: GetManyQuery): Promise<TechnicianDto[]> {
    return this.technicianService.findMany(query as GetManyQueryType<'Technician'>);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<TechnicianDto> {
    return this.technicianService.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTechnicianDto: CreateTechnicianDto): Promise<TechnicianDto> {
    return this.technicianService.create(createTechnicianDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTechnicianDto: UpdateTechnicianDto,
  ): Promise<TechnicianDto> {
    return this.technicianService.update(id, updateTechnicianDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.technicianService.remove(id);
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

    const safeFilename = `technician_${id}${ext}`;
    // const safeFilename = `image_${id}_${timestamp}${ext}`;
    const filePath = path.join(uploadDir, safeFilename);

    await pipeline(data.file, createWriteStream(filePath));

    const src = `https://localhost:3000/Service-Api/uploads/${safeFilename}`;
    await this.technicianService.setTechnicianImageSrc(id, src);
  }
}
