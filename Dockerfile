# ── Build the React app ──
FROM node:22-alpine AS web
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# ── Run API (+ serves the built UI) ──
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY backend/package*.json backend/
RUN npm ci --omit=dev --prefix backend
COPY backend backend
COPY --from=web /app/frontend/dist frontend/dist
EXPOSE 8080
CMD ["node", "backend/src/server.js"]
