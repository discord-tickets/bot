# syntax=docker/dockerfile:1

# bun > install > dev
# bun > install > build > bin<service>
# bun > install > build > dist<service>

FROM oven/bun:1-slim AS bun
# /usr/local/src/app
WORKDIR /build

FROM bun AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM bun AS dev
COPY --from=install /build/node_modules node_modules
COPY . .
ENTRYPOINT [ "bun", "run", "-F", "'*'", "dev" ]

FROM bun AS build
COPY --from=install /build/node_modules node_modules
COPY . .
# TODO: test types
RUN bun run -F '*' test \
	&& bun run -F '*' build

FROM scratch AS bin
COPY --from=build \
	/build/services/${SERVICE}/${SERVICE} \
	.

FROM debian:bookworm-slim AS dist
# debian-slim is a bit bigger than alpine but bun says gcc is faster than musl.
# args are scoped to this stage so other stages can be cached
ARG uid=1000 \
	gid=1000
ARG service
ENV SERVICE=${service}
ENV BUN_RUNTIME_TRANSPILER_CACHE_PATH=0
ENV NODE_ENV=production
RUN groupadd container \
	--gid $gid \
	&& useradd container \
	--uid $uid \
	--gid container \
	--shell /bin/sh \
	--create-home
USER container
WORKDIR /home/container
COPY --from=build \
	/build/services/${SERVICE}/${SERVICE} \
	/usr/local/bin/${SERVICE}
ENTRYPOINT [ ${SERVICE} ]
