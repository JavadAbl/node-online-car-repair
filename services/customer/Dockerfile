FROM node:24.16-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install dependencies
# RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
 RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" npx prisma generate

EXPOSE 3023

# Use nodemon or tsx watch for development
CMD ["npm", "run", "dev"]
