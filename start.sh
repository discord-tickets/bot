#!/bin/sh
#Creating db.key with  encryption key if the file don't exist (so it's not regenerating a key each container start)
if [ ! -f db.key ]; then
KEY=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
echo "$KEY" > db.key
fi

#set the encryption key from the existing or newly generated one
DB_ENCRYPTION_KEY=$(cat "db.key")

#Creating .env from docker-compose values
echo "DISCORD_TOKEN=$DISCORD_TOKEN
DB_ENCRYPTION_KEY=$DB_ENCRYPTION_KEY
DB_TYPE=$DB_TYPE
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASS=$DB_PASS
DB_TABLE_PREFIX=$DB_TABLE_PREFIX" > .env

#installing mysql2 npm module so it don't crash
npm install mysql2

echo "The Database encryption key is $DB_ENCRYPTION_KEY Don't lose it"

#starting the bot
npm start
