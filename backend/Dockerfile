FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm ci

COPY backend ./backend
RUN npm run build --workspace backend

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/frontend/package.json ./frontend/package.json
COPY --from=build /app/backend/dist ./backend/dist
RUN npm ci --omit=dev --workspace backend

WORKDIR /app/backend
EXPOSE 3000
CMD ["node", "dist/server.js"]