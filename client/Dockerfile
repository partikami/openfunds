# Development stage
FROM node:24-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD ["npm", "run", "dev"]

# Production stage
FROM node:24-alpine AS production

WORKDIR /app

# Install serve globally in production stage
RUN npm install -g serve

# Copy only the built application from development stage
COPY --from=development /app/dist ./dist

# Expose port 3000 (default for serve)
EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]