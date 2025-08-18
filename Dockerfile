# syntax=docker/dockerfile:1

FROM node:22-alpine3.20 AS builder

# install required depencencies for node-gyp
RUN apk add --no-cache make gcc g++ python3

RUN npm install -g pnpm

WORKDIR /build

COPY --link scripts scripts
RUN chmod +x ./scripts/start.sh

COPY package.json pnpm-lock.yaml ./

RUN CI=true pnpm install --prod --frozen-lockfile

COPY --link . .

FROM node:22-alpine3.20 AS runner
LABEL org.opencontainers.image.source=https://github.com/discord-tickets/bot \
	org.opencontainers.image.description="The most popular open-source ticket bot for Discord." \
	org.opencontainers.image.licenses="GPL-3.0-or-later"

RUN apk --no-cache add curl

RUN adduser --disabled-password --home /home/container container
RUN mkdir /app \
	&& chown container:container /app \
	&& chmod -R 777 /app

RUN mkdir -p /home/container/user /home/container/logs \
    && chown -R container:container /home/container

USER container
ENV USER=container \
	HOME=/home/container \
	NODE_ENV=production \
	HTTP_HOST=0.0.0.0 \
	DOCKER=true

WORKDIR /home/container

COPY --from=builder --chown=container:container --chmod=777 /build /app

ENTRYPOINT [ "/app/scripts/start.sh" ]
HEALTHCHECK --interval=15s --timeout=5s --start-period=60s \
	CMD curl -f http://localhost:${HTTP_PORT}/status || exit 1
