require('dotenv').config();
const fs = require('fs-extra');
// const { promisify } = require('util');
// const exec = promisify(require('child_process').exec);
const { spawnSync } = require('child_process');

const providers = ['mysql', 'postgresql', 'sqlite'];
const provider = process.env.DB_PROVIDER;
if (!providers.includes(provider)) throw new Error(`DB_PROVIDER must be one of: ${providers}`);

if (!fs.existsSync('./prisma')) fs.mkdirSync('./prisma');
fs.copySync(`./db/${provider}`, './prisma'); // copy schema & migrations

npx('prisma generate');
npx('prisma migrate deploy');

function npx(cmd) {
	const child = spawnSync('npx', cmd.split(/\s/));
	if (child.stdout) console.log(child.stdout.toString());
	if (child.stderr) console.log(child.stderr.toString());
	if (child.status) process.exit(child.status);
}