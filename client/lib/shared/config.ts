import dotenv from "dotenv";
dotenv.config();

export const appConfig = {
  NODE_ENV: process.env.NODE_ENV || "development",
  HTTP_PORT: parseInt(process.env.HTTP_PORT!),
  HTTP_HOST: process.env.HTTP_HOST!,
  BACKEND_URL: process.env.DATABASE_HOST!,
};

export function validateConfig() {
  for (const [key, value] of Object.entries(appConfig)) {
    if (!value) {
      console.error(
        `❌ Error: Environment variable "${key}" is missing or empty.`,
      );
      process.exit(1);
    }
  }
}

export const isDev = appConfig.NODE_ENV.toLocaleLowerCase() === "development";
