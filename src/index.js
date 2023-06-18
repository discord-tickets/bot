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

/* eslint-disable no-console */

const pkg = require('../package.json');
const banner = require('./lib/banner');
console.log(banner(pkg.version)); // print big title

const semver = require('semver');
const { colours } = require('leeks.js');

// check node version
if (!semver.satisfies(process.versions.node, pkg.engines.node)) {
	console.log('\x07' + colours.redBright(`Error: Your current Node.js version, ${process.versions.node}, does not meet the requirement "${pkg.engines.node}". Please update to version ${semver.minVersion(pkg.engines.node).version} or higher.`));
	process.exit(1);
}

// this could be done first, but then there would be no banner :(
process.env.NODE_ENV ??= 'production'; // make sure NODE_ENV is set
require('./env').load(); // load and check environment variables

const fs = require('fs');
const YAML = require('yaml');
const logger = require('./lib/logger');
const Client = require('./client');
const http = require('./http');

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

const config = YAML.parse(fs.readFileSync('./user/config.yml', 'utf8'));
const log = logger(config);

process.on('uncaughtException', (error, origin) => {
	log.notice(`Discord Tickets v${pkg.version} on Node.js ${process.version} (${process.platform})`);
	log.warn(origin === 'uncaughtException' ? 'Uncaught exception' : 'Unhandled promise rejection' + ` (${error.name})`);
	log.error(error);
});

process.on('warning', warning => log.warn(warning.stack));

const client = new Client(config, log);
client.login().then(() => {
	http(client);
});
