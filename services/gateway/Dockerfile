FROM node:24.16-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
# RUN npm ci

# Copy the rest of the application code
COPY . .

EXPOSE 3000

# Use nodemon or tsx watch for development
CMD ["npm", "run", "dev"]
