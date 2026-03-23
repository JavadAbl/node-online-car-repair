import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/error-handler/error-handler.filter';
import { ConfigService } from '@nestjs/config';
import { AppConfig, ConfigType } from './common/config/config.type';
import { AuthService } from './infrastructure-modules/auth-module/auth.service';
import { CustomerController } from './customer-module/_module/controllers/customer.controller';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const authService = app.get<AuthService>(AuthService);

  authService.addControllerPermissions(CustomerController);
  await authService.setupPermissions();

  app.useGlobalFilters(new AllExceptionsFilter());

  // app.setGlobalPrefix('/api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const configService = app.get(ConfigService<ConfigType>);
  const port = configService.get<AppConfig>('app')!.HTTP_PORT;

  await app.listen(port);
}
bootstrap();
