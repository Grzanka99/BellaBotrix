# Single image for both bot and sup; compose.yaml picks the entrypoint per service.
FROM docker.io/oven/bun:1.4.4

# Prisma query engine (debian-openssl-3.0.x) needs OpenSSL
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install deps first so source changes don't bust the cache
COPY package.json bun.lock ./
COPY prisma ./prisma
COPY apps/bot/package.json ./apps/bot/
COPY apps/sup/package.json ./apps/sup/
COPY apps/web/package.json ./apps/web/
COPY packages/bellatrix/package.json ./packages/bellatrix/
COPY packages/common/package.json ./packages/common/
COPY packages/r6dle/package.json ./packages/r6dle/
COPY packages/sqlite-storage/package.json ./packages/sqlite-storage/
COPY packages/twitch-api-connector/package.json ./packages/twitch-api-connector/
# Root + bot + sup only; the web app is deployed separately
RUN bun install --frozen-lockfile --filter BellaBotrix --filter bot --filter sup

COPY . .

# Shared SQLite storage used by bot and sup to talk to each other
RUN mkdir -p /data && chown bun:bun /data
VOLUME /data
ENV SHARED_DB_FILE=/data/shared.db \
    SYNC_PORT=5000

USER bun
EXPOSE 5000

CMD ["bun", "run", "--cwd", "apps/sup", "start"]
