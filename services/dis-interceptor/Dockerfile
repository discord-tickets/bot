# syntax=docker/dockerfile:1

FROM node:22-alpine3.20 AS builder
WORKDIR /build
# install python etc so node-gyp works for the optional dependencies
RUN apk add --no-cache make gcc g++ python3
# install pnpm to make dependency installation faster (because it has a lockfile)
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
COPY --link scripts scripts
RUN chmod +x ./scripts/start.sh
# install dependencies, CI=true to skip pre/postinstall scripts
RUN CI=true pnpm install --prod --frozen-lockfile
COPY --link . .

FROM node:22-alpine3.20 AS runner
RUN apk --no-cache add curl \
	&& adduser --disabled-password --home /home/container container \
	&& mkdir /app \
	&& chown container:container /app \
	&& chmod -R 777 /app
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
LABEL org.opencontainers.image.source=https://github.com/discord-tickets/bot \
	org.opencontainers.image.description="The most popular open-source ticket bot for Discord." \
	org.opencontainers.image.licenses="GPL-3.0-or-later"
