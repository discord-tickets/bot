# syntax=docker/dockerfile:1

FROM oven/bun:1-alpine AS base
WORKDIR /usr/src/app


FROM base AS install
# cache  dependencies
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

FROM base AS dev
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

USER bun
ENTRYPOINT [ "bun", "run", "dev" ]

FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

RUN bun test
RUN bun run build

FROM alpine:3 AS prod
# distribute a minimal image with only the binary

LABEL org.opencontainers.image.licenses="GPL-3.0-or-later"
LABEL org.opencontainers.image.source=https://github.com/discord-tickets/bot

ENV BUN_RUNTIME_TRANSPILER_CACHE_PATH=0
ENV NODE_ENV=production

RUN addgroup -g 1000 bun \
	&& adduser -u 1000 -G bun -s /bin/sh -D bun

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/service .

USER bun
ENTRYPOINT [ "./service" ]
# TODO: single context: https://pnpm.io/docker