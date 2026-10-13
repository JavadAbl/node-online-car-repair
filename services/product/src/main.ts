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
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';

async function bootstrap() {
  // Plain HTTP adapter: fastify would only enable TLS if an `https` option
  // object with key/cert were passed (the old native-dev TLS experiment —
  // see git history). In compose every hop is plain HTTP inside the network.
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

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

  // Serve the uploads folder at /uploads. It is reached from the browser
  // through the gateway as /Service-Api/uploads/* (the gateway wildcard
  // strips the service-api prefix before forwarding here).
  //@ts-ignore
  await app.register(fastifyStatic, {
    root: join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
    decorateReply: false,
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const port = configService.get<AppConfig>('app')!.HTTP_PORT;
  const host = configService.get<AppConfig>('app')!.HTTP_HOST;

  // CRITICAL: pass the host explicitly. Fastify's default listen host is
  // "localhost" — app.listen(port) alone binds 127.0.0.1 INSIDE the
  // container, making the service unreachable from the gateway/nginx
  // (connection refused -> gateway answers 503 "currently unavailable").
  // Express's default is 0.0.0.0, which is why the Express-based services
  // never hit this. HTTP_HOST=0.0.0.0 in the env makes it reachable on the
  // compose network (and stays correct for native dev via localhost).
  await app.listen(port, host);
}
bootstrap();
