FROM node:24.16

WORKDIR /app

COPY package*.json ./

# RUN npm ci

COPY . .

CMD ["sh", "-c", "npx prisma generate && npx prisma db push --accept-data-loss && npm run dev"]

