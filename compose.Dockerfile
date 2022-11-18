# Use the alpine image of node 16
FROM node:16-alpine

# Create a dir for the app and make it owned by a non-root user (node)
RUN mkdir /tickets && \
	chown -R 1000:1000 /tickets
WORKDIR /tickets

# Change user to node
USER node

# Install packages
COPY --chown=1000:1000 package.json pnpm-lock.yaml ./
RUN npx pnpm install --prod --frozen-lockfile --no-optional && \
	# Currently WIP since pnpm installs dev deps automatically when I don't want it to.
	# Quick fix is to add to main deps
	npx pnpm install mysql2

# Set the command
CMD ["node", "src/"]
