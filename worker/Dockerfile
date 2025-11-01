FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
ENV BACKEND_URL=https://backend:3001
ENV HEARTBEAT_INTERVAL=30000
ENV MAX_CONCURRENT_TASKS=3

HEALTHCHECK --interval=60s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "process.exit(0)"

CMD ["npm", "start"]
