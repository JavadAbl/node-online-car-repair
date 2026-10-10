FROM node:24.16

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# RUN npm ci

COPY . .

# RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" npx prisma generate


EXPOSE 3024

# Wipe any stale/partial Prisma output (e.g. untracked leftovers in the
# bind-mounted src from previous runs) so 'prisma generate' is idempotent
# and never refuses with "exists and is not empty".
CMD ["sh", "-c", "rm -rf src/infrastructure/database/generated/prisma && npx prisma generate && npx prisma db push --accept-data-loss && npm run dev"]
