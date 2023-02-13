#We start from NodeJS 18 image
FROM node:18-alpine

#We create the bot folder and we set the WORKDIR on it
RUN mkdir /opt/bot
WORKDIR /opt/bot

#Installing bot dependencies
COPY . ./
RUN npm i \
    && chmod +x ./start.sh \
    && rm .env

#We set the entrypoint
ENTRYPOINT [ "/opt/bot/start.sh" ]
