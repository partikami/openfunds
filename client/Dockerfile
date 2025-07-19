# --- Stage 1: Build Frontend Assets ---
FROM node:24-alpine AS build_stage

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_BASE_URL

RUN npm run build

# --- Stage 2: Serve Production Assets with Nginx ---
FROM nginx:alpine AS production

COPY --from=build_stage /app/dist /usr/share/nginx/html

# Copy your Nginx configuration file
# This file will be created/updated below in the nginx/ directory
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose Nginx's default HTTP port
EXPOSE 80

# Command to start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]