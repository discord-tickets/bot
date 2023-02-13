#We start from NodeJS 18 image
FROM node:18-alpine

#We create the bot folder and we set the WORKDIR on it
RUN mkdir /opt/bot
WORKDIR /opt/bot

#Installing bot dependencies
COPY . ./
RUN npm i --production

#We copy the bot files
COPY . ./

#We authorize the execution of the entrypoint
RUN chmod +x ./start.sh \
    && rm .env

EXPOSE 8080

#We set the entrypoint
ENTRYPOINT [ "/opt/bot/start.sh" ]
