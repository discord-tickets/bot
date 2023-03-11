# syntax=docker/dockerfile:1

FROM node:18-alpine AS builder
WORKDIR /build
# install python etc so node-gyp works for the optional dependencies
RUN apk add --no-cache make gcc g++ python3
# install pnpm to make dependency installation faster (because it has a lockfile)
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
COPY --link scripts scripts
# install dependencies, CI=true to skip pre/postinstall scripts
RUN CI=true pnpm install --prod --frozen-lockfile
COPY --link . .

FROM node:18-alpine AS runner
ENV NODE_ENV=production \
	HTTP_HOST=0.0.0.0 \
	HTTP_PORT=80 \
	SETTINGS_HOST=127.0.0.1 \
	SETTINGS_PORT=8169
WORKDIR /usr/bot
COPY --from=builder /build ./
RUN chmod +x /usr/bot/scripts/start.sh
EXPOSE ${HTTP_PORT}
ENTRYPOINT [ "/usr/bot/scripts/start.sh" ]
