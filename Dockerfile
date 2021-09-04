FROM node:16.6.1-buster-slim

WORKDIR /usr/src/app

ENV NODE_ENV production

COPY package*.json ./
RUN npm ci --production

# Note: this is because currently we have a check for .env file presence
# This should be removed if that .env check gets removed.
COPY .env .
COPY ./src ./src
COPY ./user ./user

USER node
CMD ["node", "."]