import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/error-handler/error-handler.filter';
import { ConfigService } from '@nestjs/config';
import { AppConfig, ConfigType } from './common/config/config.type';
import { addControllerPermissions } from './app-permissions';
import { CustomerController } from './customer-module/_module/controllers/customer.controller';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionsFilter());

  // app.setGlobalPrefix('/api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const configService = app.get(ConfigService<ConfigType>);
  const port = configService.get<AppConfig>('app')!.HTTP_PORT;

  addControllerPermissions(CustomerController);

  await app.listen(port);
}
bootstrap();
