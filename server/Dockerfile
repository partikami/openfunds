# Development stage
FROM node:24-alpine AS development

WORKDIR /app

COPY package*.json ./
COPY vendor ./vendor

RUN npm ci

COPY . .

RUN npm run build

CMD ["npm", "run", "dev"]

# Production stage
FROM node:24-alpine AS production

WORKDIR /app

COPY package*.json ./
COPY vendor ./vendor

RUN npm ci --only=production

COPY . .

CMD ["node", "server.js"]