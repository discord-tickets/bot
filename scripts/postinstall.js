require('dotenv').config();
const fs = require('fs-extra');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function npx(cmd) {
	console.log(`[postinstall] > ${cmd}`);
	const {
		stderr,
		stdout,
	} = await exec('npx ' + cmd);
	if (stdout) console.log(stdout.toString());
	if (stderr) console.log(stderr.toString());
}

const providers = ['mysql', 'postgresql', 'sqlite'];
const provider = process.env.DB_PROVIDER;

if (!provider) {
	console.log('[postinstall] environment not set, exiting.');
	process.exit(0);
}

if (!providers.includes(provider)) throw new Error(`DB_PROVIDER must be one of: ${providers}`);

console.log(`[postinstall] provider=${provider}`);
console.log(`[postinstall] copying ${provider} schema & migrations`);

if (!fs.existsSync('./prisma')) fs.mkdirSync('./prisma');
fs.copySync(`./db/${provider}`, './prisma'); // copy schema & migrations

(async () => {
	await npx('prisma generate');
	await npx('prisma migrate deploy');
})();

