FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy backend source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]