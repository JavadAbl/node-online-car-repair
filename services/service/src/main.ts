import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/error-handler/error-handler.filter';
import { ConfigService } from '@nestjs/config';
import { AppConfig, ConfigType } from './common/config/config.type';
import { AuthService } from './infrastructure-modules/auth-module/auth.service';
import { TechnicianController } from './technician-module/contollers/technician.controller';
import { ServiceController } from './serivce-module/controllers/service.controller';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';

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

  authService.addControllerPermissions(TechnicianController);
  authService.addControllerPermissions(ServiceController);
  await authService.setupPermissions();

  await app
    .getHttpAdapter()
    .getInstance()
    //@ts-ignore
    .register(fastifyMultipart, {
      //   attachFieldsToBody: true,
      limits: {
        fileSize: 1024 * 512, // 512KB
      },
    });

  // Serve /uploads as /Service-Api/uploads/
  //@ts-ignore
  await app.register(fastifyStatic, {
    root: join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
    decorateReply: false,
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const port = configService.get<AppConfig>('app')!.HTTP_PORT;

  await app.listen(port);
}
bootstrap();
