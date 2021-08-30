FROM node:16.6.1-buster-slim

WORKDIR /usr/src/app

ENV NODE_ENV production

COPY package*.json ./
RUN npm ci --production

COPY ./src ./src
COPY ./user ./user

USER node
CMD ["node", "."]