FROM node:20-slim AS base
WORKDIR /app

FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build

FROM node:20-slim AS runner
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /app/.next/standalone /app
COPY --from=build /app/.next/static /app/.next/static
COPY --from=build /app/public /app/public
COPY --from=build /app/db/migrations-postgres /app/db/migrations-postgres
COPY --from=build /app/scripts/migrate.mjs /app/scripts/migrate.mjs
EXPOSE 8080
CMD ["sh", "-c", "node scripts/migrate.mjs && node server.js"]
