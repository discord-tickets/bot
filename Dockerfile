FROM node:16

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm i --production

COPY . .
CMD ["npm", "start"]