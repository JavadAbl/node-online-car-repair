FROM node:24-slim

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Copy the rest of the application code
# (compose bind-mounts ./client over this for hot reload;
#  node_modules stays in a named volume so it is never shadowed)
COPY . .

EXPOSE 3000
CMD ["sh", "-c", "exec npm run dev"]
# Dev server, consistent with the other services' dev-style containers.
# Dependencies are installed into the named volume on first boot.
# --hostname 0.0.0.0 so nginx can reach the container over the compose network.
# Install into the container-owned named volume (client_node_modules).
# Fast no-op when the volume is already in sync with package.json.
# CMD ["sh", "-c", "npm install --no-audit --no-fund && npm run dev -- --hostname 0.0.0.0"]
