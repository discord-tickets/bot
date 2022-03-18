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

import dotenv from 'dotenv-cra';
import fs from 'fs';
import semver from 'semver';
import { colours } from 'leeks.js';
import logger from './lib/logger.mjs';
import banner from './lib/banner.mjs';
import YAML from 'yaml';

process.env.NODE_ENV ??= 'development'; // make sure NODE_ENV is set
dotenv.config(); // load env file

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// check node version
if (!semver.satisfies(process.versions.node, pkg.engines.node)) {
	console.log('\x07' + colours.redBright(`Error: Discord Tickets requires Node.js version ${pkg.engines.node}; you are currently using ${process.versions.node}`));
	process.exit(1);
}

if (process.env.DB_ENCRYPTION_KEY === undefined) {
	console.log('\x07' + colours.redBright('Error: The "DB_ENCRYPTION_KEY" environment variable is not set.\nRun "npm run keygen" to generate a key, or set it to "false" to disable encryption (not recommended).'));
	process.exit(1);
}

console.log(banner(pkg.version)); // print big title

process.env.CONFIG_PATH ??= './user/config.yml'; // set default config file path

if (!fs.existsSync(process.env.CONFIG_PATH)) {
	const examplePath = './user/example.config.yml';
	if (!fs.existsSync(examplePath)) {
		console.log('\x07' + colours.redBright('The config file does not exist, and the example file is missing so cannot be copied from.'));
		process.exit(1);
	} else {
		console.log('Creating config file...');
		fs.copyFileSync(examplePath, process.env.CONFIG_PATH);
		console.log(`Copied config to ${process.env.CONFIG_PATH}`);
	}
}

const config = YAML.parse(fs.readFileSync(process.env.CONFIG_PATH, 'utf8'));

const log = logger(config);


process.on('unhandledRejection', error => {
	log.notice(`Discord Tickets v${pkg.version} on Node.js v${process.versions.node} (${process.platform})`);
	log.notice('An error was not caught');
	if (error instanceof Error) log.warn(`Uncaught ${error.name}`);
	log.error(error);
});

