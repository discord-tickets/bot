/* eslint-disable no-console */
const { randomBytes } = require('crypto');
const fs = require('fs');
const { short } = require('leeks.js');

function log (...strings) {
	console.log(short('&9[preinstall]&r'), ...strings);
}

const env = {
	DB_CONNECTION_URL: '',
	DB_PROVIDER: '', // don't default to sqlite, postinstall checks if empty
	DISCORD_SECRET: '',
	DISCORD_TOKEN: '',
	ENCRYPTION_KEY: randomBytes(24).toString('hex'),
	HTTP_EXTERNAL: 'http://127.0.0.1:8080',
	HTTP_HOST: '127.0.0.1',
	HTTP_PORT: 8080,
	HTTP_TRUST_PROXY: false,
	OVERRIDE_ARCHIVE: '',
	PUBLIC_BOT: false,
	SETTINGS_HOST: '127.0.0.1',
	SETTINGS_PORT: 8169,
	SUPER: '319467558166069248',
};

// check ENCRYPTION_KEY because we don't want to force use of the .env file
if (!process.env.ENCRYPTION_KEY && !fs.existsSync('./.env')) {
	log('generating ENCRYPTION_KEY');
	fs.writeFileSync('./.env', Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n'));
	log('created .env file');
} else {
	log('nothing to do');
}