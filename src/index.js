/**
 * Discord Tickets
 * Copyright (C) 2022 Isaac Saunders
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @name discord-tickets/bot
 * @description An open-source Discord bot for ticket management
 * @copyright 2022 Isaac Saunders
 * @license GNU-GPLv3
 */

const pkg = require('../package.json');
const fs = require('fs');
const semver = require('semver');
const { colours } = require('leeks.js');
const logger = require('./lib/logger');
const banner = require('./lib/banner');
const YAML = require('yaml');
const Client = require('./client');
const http = require('./http');

process.env.NODE_ENV ??= 'development'; // make sure NODE_ENV is set
require('dotenv').config(); // load env file

// check node version
if (!semver.satisfies(process.versions.node, pkg.engines.node)) {
	console.log('\x07' + colours.redBright(`Error: Your current Node.js version, ${process.versions.node}, does not meet the requirement "${pkg.engines.node}".`));
	process.exit(1);
}

if (process.env.ENCRYPTION_KEY === undefined) {
	console.log('\x07' + colours.redBright('Error: The "ENCRYPTION_KEY" environment variable is not set.\nRun "npm run keygen" to generate a key.'));
	process.exit(1);
}

if (!fs.existsSync('./user/config.yml')) {
	const examplePath = './user/example.config.yml';
	if (!fs.existsSync(examplePath)) {
		console.log('\x07' + colours.redBright('The config file does not exist, and the example file is missing so cannot be copied from.'));
		process.exit(1);
	} else {
		console.log('Creating config file...');
		fs.copyFileSync(examplePath, './user/config.yml');
		console.log(`Copied config to ${'./user/config.yml'}`);
	}
}

console.log(banner(pkg.version)); // print big title

const config = YAML.parse(fs.readFileSync('./user/config.yml', 'utf8'));
const log = logger(config);

process.on('unhandledRejection', error => {
	log.notice(`Discord Tickets v${pkg.version} on Node.js v${process.versions.node} (${process.platform})`);
	log.notice('An error was not caught');
	if (error instanceof Error) log.warn(`Uncaught ${error.name}`);
	log.error(error);
});

const client = new Client(config, log);
client.login().then(() => {
	http(client);
});