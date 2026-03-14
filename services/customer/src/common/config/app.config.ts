import { registerAs } from '@nestjs/config';
import { nodeEnvs } from './config.type';
import Joi from 'joi';

export const config = () => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  HTTP_PORT: parseInt(process.env.HTTP_PORT || '0'),
  HTTP_HOST: process.env.HTTP_HOST!,
  DATABASE_HOST: process.env.DATABASE_HOST!,
  DATABASE_PORT: parseInt(process.env.DATABASE_PORT || '0'),
  DATABASE_USERNAME: process.env.DATABASE_USERNAME!,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD!,
  DATABASE_NAME: process.env.DATABASE_NAME!,
  RABBITMQ_URL: process.env.RABBITMQ_URL!,
  REDIS_HOST: process.env.REDIS_HOST!,
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '0'),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD!,
});

export const appConfig = registerAs('app', config);

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...Object.values(nodeEnvs))
    .default('development'),

  HTTP_PORT: Joi.number().port().required(),
  HTTP_HOST: Joi.string().hostname().required(),

  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().port().required(),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),

  RABBITMQ_URL: Joi.string().uri().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().port().required(),
  REDIS_PASSWORD: Joi.string().required(),
});

export const env = process.env.NODE_ENV;
export const isDev = env === nodeEnvs.Development;
