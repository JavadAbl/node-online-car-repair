FROM node:24.16

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# RUN npm ci

COPY . .

#  RUN DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy" npx prisma generate

EXPOSE 3021

CMD ["sh", "-c", "npx prisma generate && npx prisma db push --accept-data-loss && npm run dev"]

