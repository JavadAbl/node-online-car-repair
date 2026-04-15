import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/error-handler/error-handler.filter';
import { ConfigService } from '@nestjs/config';
import { AppConfig, ConfigType } from './common/config/config.type';
import { AuthService } from './infrastructure-modules/auth-module/auth.service';
import { RepairmanController } from './repairman-module/contollers/repairman.controller';
import { ServiceController } from './serivce-module/controllers/service.controller';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
  const httpsOptions = {
    http2: true,
    https: {
      key: readFileSync(join(process.cwd(), 'localhost-private.key')),
      cert: readFileSync(join(process.cwd(), 'localhost-cert.pem')),
      allowHTTP1: true, // Optional: fall back to HTTP/1.1
    },
  };

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(httpsOptions));

  const configService = app.get<ConfigService<ConfigType>>(ConfigService);

  const authService = app.get<AuthService>(AuthService);

  authService.addControllerPermissions(RepairmanController);
  authService.addControllerPermissions(ServiceController);
  await authService.setupPermissions();

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const port = configService.get<AppConfig>('app')!.HTTP_PORT;

  await app.listen(port);
}
bootstrap();
