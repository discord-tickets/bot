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
RUN npx pnpm install --prod --frozen-lockfile

# Copy src folder
COPY src ./src

# Set the command
CMD ["node", "src/"]
