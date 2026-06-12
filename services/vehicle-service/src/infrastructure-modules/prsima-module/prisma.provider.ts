import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from 'src/generated/prisma/client';
import { AppConfig, ConfigType } from '../../common/config/config.type';
import { ConfigService } from '@nestjs/config';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.DEFAULT })
export class PrismaProvider extends PrismaClient {
  constructor(configService: ConfigService<ConfigType>) {
    const config = configService.getOrThrow<AppConfig>('app');

    const adapter = new PrismaMariaDb({
      ssl: false,
      host: config.HTTP_HOST,
      user: config.DATABASE_USERNAME,
      password: config.DATABASE_PASSWORD,
      database: config.DATABASE_NAME,
      port: config.DATABASE_PORT,
      allowPublicKeyRetrieval: true,
    });
    super({ adapter });
  }
}
