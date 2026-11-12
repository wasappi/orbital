# syntax=docker/dockerfile:1

# ---- Build stage: full toolchain, produces the self-contained .output/ ----
FROM node:24-slim AS build
WORKDIR /app

# Dependencies first → this layer stays cached as long as package*.json don't change.
# --ignore-scripts: our postinstall (nuxt prepare + cesium copy) needs the sources, so it runs below.
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run postinstall && npm run build

# ---- Runtime stage: only Node + the build output (no sources, no node_modules) ----
FROM node:24-slim
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

COPY --from=build --chown=node:node /app/.output ./.output

USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
