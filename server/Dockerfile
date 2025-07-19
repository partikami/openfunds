# --- Stage 1: Build/Install Dependencies ---
FROM node:24-alpine AS build_stage

WORKDIR /app

COPY package*.json ./
COPY vendor ./vendor
RUN npm ci --omit=dev
COPY . .

# --- Stage 2: Production Runtime ---
FROM node:24-alpine AS production

WORKDIR /app

# Copy only production dependencies from the build_stage
COPY --from=build_stage /app/node_modules ./node_modules

# Copy essential files for runtime
COPY --from=build_stage /app/package*.json ./
COPY --from=build_stage /app/server.js ./
COPY --from=build_stage /app/controllers ./controllers
COPY --from=build_stage /app/db ./db
COPY --from=build_stage /app/mailtrap ./mailtrap
COPY --from=build_stage /app/middleware ./middleware
COPY --from=build_stage /app/models ./models
COPY --from=build_stage /app/routes ./routes
COPY --from=build_stage /app/utils ./utils

# COPY --from=build_stage /app/config ./config
# COPY --from=build_stage /app/uploads ./uploads

COPY vendor ./vendor

EXPOSE 5050
CMD ["node", "server.js"]