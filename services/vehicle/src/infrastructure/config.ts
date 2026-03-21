import dotenv from "dotenv";
dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  HTTP_PORT: parseInt(process.env.HTTP_PORT!),
  HTTP_HOST: process.env.HTTP_HOST!,
  DATABASE_HOST: process.env.DATABASE_HOST!,
  DATABASE_PORT: parseInt(process.env.DATABASE_PORT!),
  DATABASE_USERNAME: process.env.DATABASE_USERNAME!,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD!,
  DATABASE_NAME: process.env.DATABASE_NAME!,
  RABBITMQ_URL: process.env.RABBITMQ_URL!,
  REDIS_HOST: process.env.REDIS_HOST!,
  REDIS_PORT: parseInt(process.env.REDIS_PORT!),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD!,
};

export function validateConfig() {
  for (const [key, value] of Object.entries(config)) {
    if (!value) {
      console.error(`❌ Error: Environment variable "${key}" is missing or empty.`);
      process.exit(1);
    }
  }
}

export const isDev = config.NODE_ENV.toLocaleLowerCase() === "development";
