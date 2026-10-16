FROM node:24.18-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
# RUN npm ci

# Copy the rest of the application code
COPY . .

EXPOSE 3000
CMD [ "npm","run","dev" ]
# Use nodemon or tsx watch for development
# Install into the container-owned named volume (gateway_node_modules).
# Fast no-op when the volume is already in sync with package.json.
# CMD ["sh", "-c", "npm install --no-audit --no-fund && npm run dev"]
