# Use the alpine image of node 16
FROM node:16-alpine

# Create a dir for the app and set the workdir on it
RUN mkdir /opt/tickets
WORKDIR /opt/tickets

# Install packages
COPY package.json pnpm-lock.yaml ./
RUN npm i --production

# Copy usefull folders
COPY . ./
RUN chmod +x start.sh
RUN rm *.env

# Set the entrypoint
ENTRYPOINT [ "/opt/tickets/start.sh" ]
