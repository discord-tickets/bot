/* eslint-disable no-console */
require('dotenv').config();
const fs = require('fs-extra');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { short } = require('leeks.js');

const fallback = { prisma: './node_modules/prisma/build/index.js' };

function log(...strings) {
	console.log(short('&9[postinstall]&r'), ...strings);
}

async function npx(cmd) {
	const parts = cmd.split(' ');
	// fallback for environments with no symlink/npx support (PebbleHost)
	if (!fs.existsSync(`./node_modules/.bin/${parts[0]}`)) {
		const x = parts.shift();
		cmd = 'node ' + fallback[x] + ' ' + parts.join(' ');
	} else {
		cmd = 'npx ' + cmd;
	}
	log(`> ${cmd}`);
	const {
		stderr,
		stdout,
	} = await exec(cmd);
	if (stdout) console.log(stdout.toString());
	if (stderr) console.log(stderr.toString());
}

const providers = ['mysql', 'postgresql', 'sqlite'];
const provider = process.env.DB_PROVIDER;

if (!provider) {
	log('environment not set, exiting.');
	process.exit(0);
}

if (!providers.includes(provider)) throw new Error(`DB_PROVIDER must be one of: ${providers}`);

log(`provider=${provider}`);
log(`copying ${provider} schema & migrations`);

if (fs.existsSync('./prisma')) {
	fs.rmSync('./prisma', {
		force: true,
		recursive: true,
	});
} else {
	fs.mkdirSync('./prisma');
}
fs.copySync(`./db/${provider}`, './prisma'); // copy schema & migrations

(async () => {
	await npx('prisma generate');
	await npx('prisma migrate deploy');
})();
