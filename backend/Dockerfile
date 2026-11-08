FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 8000

CMD ["sh", "-c", "npm run prisma:deploy && npm start"]
