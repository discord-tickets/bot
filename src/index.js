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
banner(pkg.version); // print big title

const semver = require('semver');
const { colours } = require('leeks.js');
const path = require('path');

// check node version
if (!semver.satisfies(process.versions.node, pkg.engines.node)) {
	console.log('\x07' + colours.redBright(`Error: Your current Node.js version, ${process.versions.node}, does not meet the requirement "${pkg.engines.node}". Please update to version ${semver.minVersion(pkg.engines.node).version} or higher.`));
	process.exit(1);
}

// check cwd
const base_dir = path.resolve(path.join(__dirname, '../'));
const cwd = path.resolve(process.cwd());
if (base_dir !== cwd) {
	console.log('\x07' + colours.yellowBright('Warning: The current working directory is not the same as the base directory.'));
	if (!process.env.DOCKER) {
		console.log(colours.yellowBright('This may result in unexpected behaviour, particularly with missing environment variables.'));
	}
	console.log('  Base directory:    ' + colours.gray(base_dir));
	console.log('  Current directory: ' + colours.gray(cwd));
	console.log(colours.blueBright('  Learn more at https://lnk.earth/dt-cwd.'));
}

process.env.NODE_ENV ??= 'production'; // make sure NODE_ENV is set
require('./env').load(); // load and check environment variables

// INIT Sentry if required ENV vars are set
const sentryEnabled = !!process.env.SENTRY_DSN;
if(sentryEnabled) {
	require('./sentry-init.js');
}

const fs = require('fs');
const YAML = require('yaml');
const logger = require('./lib/logger');

// create a Logger using the default config
// and set listeners as early as possible.
let config = YAML.parse(fs.readFileSync(path.join(__dirname, 'user/config.yml'), 'utf8'));
let log = logger(config);

function exit(signal) {
	log.notice(`Received ${signal}`);
	client.destroy();
	process.exit(0);
}

process.on('SIGTERM', () => exit('SIGTERM'));

process.on('SIGINT', () => exit('SIGINT'));

process.on('uncaughtException', (error, origin) => {
	log.notice(`Discord Tickets v${pkg.version} on Node.js ${process.version} (${process.platform})`);
	log.warn(origin === 'uncaughtException' ? 'Uncaught exception' : 'Unhandled promise rejection' + ` (${error.name})`);
	log.error(error);
});

process.on('warning', warning => log.warn(warning.stack || warning));

const Client = require('./client');
const http = require('./http');

// the `user` directory may or may not exist depending on if sqlite is being used.
// copy any files that don't already exist
fs.cpSync(path.join(__dirname, 'user'), './user', {
	force: false,
	recursive: true,
});

// initialise the framework and client,
// which also loads the custom config and creates a new Logger.
const client = new Client(config, log);

// allow any config changes to affect the above listeners
// as long as these `client` properties are not reassigned.
config = client.config;
log = client.log;

// start the bot and then the web server
client.login().then(() => {
	http(client);
});
