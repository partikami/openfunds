# --- Stage 1: Build Frontend Assets ---
FROM node:24-alpine AS build_stage

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

ARG VITE_API_BASE_URL
RUN npm run build

EXPOSE 5173
CMD ["npm", "run", "dev"]