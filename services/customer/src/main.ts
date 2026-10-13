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
  const host = configService.get<AppConfig>('app')!.HTTP_HOST;

  // Bind the configured host explicitly (0.0.0.0 in docker) instead of
  // relying on Express's 0.0.0.0 default — the Fastify-based services must
  // pass it (fastify defaults to localhost and would be unreachable from
  // other containers), so keep every service consistent and explicit.
  await app.listen(port, host);
}
bootstrap();
