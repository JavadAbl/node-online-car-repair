import { Module } from '@nestjs/common';
import { ServiceEntityService } from './services/service-entity.service';
import { ServiceController } from './controllers/service.controller';
import { ServiceRepository } from './repository/service.repository';

@Module({
  imports: [],
  controllers: [ServiceController],
  providers: [ServiceEntityService, ServiceRepository],
})
export class ServiceModule {}
