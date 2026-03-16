import { Module } from '@nestjs/common';
import { UserService } from './services/user-service';
import { CustomerModule } from 'src/customer-module/customer.module';

@Module({ imports: [CustomerModule], providers: [UserService], exports: [UserService] })
export class EventServicesModule {}
