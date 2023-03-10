/* eslint-disable no-console */
const { randomBytes } = require('crypto');
const fs = require('fs');
const { short } = require('leeks.js');

function log (...strings) {
	console.log(short('&9[preinstall]&r'), ...strings);
}

if (process.env.CI) {
	log('CI detected, skipping');
	process.exit(0);
}

const env = {
	DB_CONNECTION_URL: '',
	DB_PROVIDER: '', // don't default to sqlite, postinstall checks if empty
	DISCORD_SECRET: '',
	DISCORD_TOKEN: '',
	ENCRYPTION_KEY: randomBytes(24).toString('hex'),
	HTTP_EXTERNAL: 'http://127.0.0.1:8169',
	HTTP_HOST: '0.0.0.0',
	HTTP_PORT: 8169,
	HTTP_TRUST_PROXY: false,
	NODE_ENV: 'production', // not bot-specific
	OVERRIDE_ARCHIVE: '',
	PUBLIC_BOT: false,
	PUBLISH_COMMANDS: false,
	SUPER: '319467558166069248',
};

// check ENCRYPTION_KEY because we don't want to force use of the .env file
if (!process.env.ENCRYPTION_KEY && !fs.existsSync('./.env')) {
	log('generating ENCRYPTION_KEY');
	fs.writeFileSync('./.env', Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n'));
	log('created .env file');
	log(short('&r&0&!e WARNING &r &e&lkeep your environment variables safe, don\'t lose your encryption key or you will lose data'));
} else {
	log('nothing to do');
}