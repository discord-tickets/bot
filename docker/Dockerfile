# syntax=docker/dockerfile:1

# bun > install > dev
# bun > install > build > bin<service>
# bun > install > build > dist<service>

FROM oven/bun:1-slim AS bun
# /usr/local/src/app
WORKDIR /build


FROM bun AS dev
ARG service
COPY . .
RUN bun install --frozen-lockfile
WORKDIR /build/services/${service}
ENTRYPOINT [ "bun", "run", "dev" ]

FROM bun AS build
COPY . .
RUN bun install --frozen-lockfile
# TODO: test types
RUN bun run -F '*' test \
	&& bun run -F '*' build

FROM scratch AS bin
ARG service=aio
COPY --from=build \
	/build/services/${SERVICE}/${SERVICE} \
	.

FROM debian:bookworm-slim AS dist
# debian-slim is a bit bigger than alpine but bun says gcc is faster than musl.
# args are scoped to this stage so other stages can be cached
ARG uid=1000 \
	gid=1000 \
	service=aio
ENV BUN_RUNTIME_TRANSPILER_CACHE_PATH=0 \
	NODE_ENV=production \
	SERVICE=${service}
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
