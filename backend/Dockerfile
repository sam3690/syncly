# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --spider http://127.0.0.1:${PORT}/health || exit 1

CMD ["node", "app.js"]
