import dotenv from "dotenv";
dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  HTTP_PORT: parseInt(process.env.HTTP_PORT!),
  HTTP_HOST: process.env.HTTP_HOST!,
  DATABASE_HOST: process.env.DATABASE_HOST!,
  DATABASE_PORT: parseInt(process.env.DATABASE_PORT!),
  DATABASE_USERNAME: process.env.DATABASE_USERNAME,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_NAME: process.env.DATABASE_NAME!,
  RABBITMQ_URL: process.env.RABBITMQ_URL!,
  REDIS_HOST: process.env.REDIS_HOST!,
  REDIS_PORT: parseInt(process.env.REDIS_PORT!),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD!,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  // Optional: fixed OTP code for dev (no SMS provider yet). Empty/unset =
  // real random codes. Validated in infrastructure/auth/otp-mock.ts —
  // NOT a required var, so it is skipped below.
  OTP_FIXED_CODE: process.env.OTP_FIXED_CODE || "",
  // Optional: mobile number seeded as the bootstrap Admin at boot (see
  // services/seed.service.ts). Empty/unset = seed disabled.
  SEED_ADMIN_MOBILE: process.env.SEED_ADMIN_MOBILE || "",
};

// Keys that may legitimately stay empty (never fail validation for these).
const OPTIONAL_CONFIG_KEYS = new Set(["OTP_FIXED_CODE", "SEED_ADMIN_MOBILE"]);

export function validateConfig() {
  for (const [key, value] of Object.entries(config)) {
    if (OPTIONAL_CONFIG_KEYS.has(key)) continue;
    if (!value) {
      console.error(`❌ Error: Environment variable "${key}" is missing or empty.`);
      process.exit(1);
    }
  }
}

export const isDev = config.NODE_ENV.toLocaleLowerCase() === "development";
