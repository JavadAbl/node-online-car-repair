import fs from 'fs';
import path from 'path';

// Define the configuration with the same logic as your source file
const config = {
  NODE_ENV: 'development',
  HTTP_PORT: 3025,
  HTTP_HOST: 'localhost',
  DATABASE_URL: 'mysql://admin:admin@localhost:3306/service_db',
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: '3306',
  DATABASE_USERNAME: 'admin',
  DATABASE_PASSWORD: 'admin',
  DATABASE_NAME: 'service_db',
  RABBITMQ_URL: `amqp://guest:guest@localhost:5672`,
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  REDIS_PASSWORD: 'redis',
};

// 1. Convert the object into a string format for .env (KEY=VALUE)
const envContent = Object.entries(config)
  .map(([key, value]) => {
    // Wrap values in quotes if they contain special characters or spaces to prevent parsing errors
    const formattedValue = typeof value === 'string' && value.includes(' ') ? `"${value}"` : value;
    return `${key}=${formattedValue}`;
  })
  .join('\n');

// 2. Define the path to the .env file in the current directory
const envFilePath = path.join(process.cwd(), '.env');

// 3. Write the content to the file
fs.writeFile(envFilePath, envContent, (err) => {
  if (err) {
    console.error('Error writing to .env file:', err);
  } else {
    console.log(`✅ Successfully created .env file at: ${envFilePath}`);
    console.log('--- Content Preview ---');
    console.log(envContent);
    console.log('---------------------');
  }
});
