FROM node:24.16-alpine

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Copy the rest of the application code
# (compose bind-mounts ./client over this for hot reload;
#  node_modules stays in a named volume so it is never shadowed)
COPY . .

EXPOSE 3000

# Dev server, consistent with the other services' dev-style containers.
# Dependencies are installed into the named volume on first boot.
# --hostname 0.0.0.0 so nginx can reach the container over the compose network.
CMD ["sh", "-c", "npm install && npm run dev -- --hostname 0.0.0.0"]
