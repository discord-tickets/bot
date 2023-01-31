#We start from NodeJS 18 image
FROM node:18-alpine

RUN mkdir /opt/bot
WORKDIR /opt/bot

COPY package.json .

RUN npm install production

COPY . ./

RUN chmod +x ./start.sh

ENTRYPOINT [ "/opt/bot/start.sh" ]