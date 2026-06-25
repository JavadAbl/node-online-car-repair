FROM node:24.16-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
# RUN npx prisma generate

EXPOSE 3000

# Use nodemon or tsx watch for development
CMD ["npm", "run", "dev"]
