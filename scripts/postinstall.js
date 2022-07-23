require('dotenv').config();
const fs = require('fs-extra');
const { spawnSync } = require('child_process');


const providers = ['mysql', 'postgresql', 'sqlite'];
const provider = process.env.DB_PROVIDER;

if (!provider) {
	console.log('[postinstall] environment not set, exiting.');
	process.exit(0);
}

if (!providers.includes(provider)) throw new Error(`DB_PROVIDER must be one of: ${providers}`);

if (!fs.existsSync('./prisma')) fs.mkdirSync('./prisma');
fs.copySync(`./db/${provider}`, './prisma'); // copy schema & migrations

npx('prisma generate');
npx('prisma migrate deploy');

function npx(cmd) {
	console.log(`[postinstall] > ${cmd}`);
	const child = spawnSync('npx', cmd.split(/\s/));
	if (child.stdout) console.log(child.stdout.toString());
	if (child.stderr) console.log(child.stderr.toString());
	if (child.status) process.exit(child.status);
}