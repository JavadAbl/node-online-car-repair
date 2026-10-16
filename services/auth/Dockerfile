# Alpine is safe here: Prisma 7 engines are WASM (schema_engine_bg.wasm /
# query_compiler_*_wasm — platform-free) and the whole dependency tree is
# pure JS (verified: no .node/.so native modules anywhere).
FROM node:24.18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# RUN npm ci

COPY . .

# RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" npx prisma generate


EXPOSE 3024
CMD ["sh", "-c", "npx prisma generate && npx prisma db push --accept-data-loss && exec npm run dev"]
# Wipe any stale/partial Prisma output (e.g. untracked leftovers in the
# bind-mounted src from previous runs) so 'prisma generate' is idempotent
# and never refuses with "exists and is not empty".
# Install into the container-owned named volume (auth_node_modules).
# Fast no-op when the volume is already in sync with package.json.
# CMD ["sh", "-c", "npm install --no-audit --no-fund && rm -rf src/infrastructure/database/generated/prisma && npx prisma generate && npx prisma db push --accept-data-loss && npm run dev"]
