/**
 * DiscordTickets
 * Copyright (C) 2021 Isaac Saunders
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
 * @name @eartharoid/discordtickets
 * @description An open-source & self-hosted Discord bot for ticket management.
 * @copyright 2021 Isaac Saunders
 * @license GNU-GPLv3
 */

const node_version = Number(process.versions.node.split('.')[0]);
if (node_version < 14)
	return console.log(`Error: DiscordTickets does not work on Node v${node_version}. Please upgrade to v14 or above.`);

const fs = require('fs');
const { path } = require('./utils/fs');

const checkFile = (file, example) => {

	file = path(file);
	example = path(example);

	if (fs.existsSync(file)) return true;
	if (!fs.existsSync(example)) {
		console.log(`Error: '${file}' not found, and unable to create it due to '${example}' being missing`);
		return process.exit();
	}

	console.log(`Copying '${example}' to '${file}'`);
	fs.copyFileSync(example, file);
	return false;

};

if (!checkFile('./.env', './example.env')) {
	console.log('Please set your bot\'s token in \'.env\'');
	process.exit();
}

checkFile('./user/config.js', './user/example.config.js');



require('dotenv').config({
	path: path('./.env')
});

const config = require('../user/config');

require('./banner')();

const Logger = require('leekslazylogger');
const log = new Logger({
	name: 'DiscordTickets by eartharoid',
	debug: config.debug,
	logToFile: config.logs.enabled,
	keepFor: config.logs.keep_for,
	custom: {
		listeners: {
			title: 'info',
			prefix: 'listeners'
		},
		commands: {
			title: 'info',
			prefix: 'commands'
		},
		plugins: {
			title: 'info',
			prefix: 'plugins'
		}
	}
});

const I18n = require('@eartharoid/i18n');
const { CommandManager } = require('./modules/commands');
const { PluginManager } = require('./modules/plugins');

const {
	Client,
	Intents
} = require('discord.js');

class Bot extends Client {
	constructor() {
		super({
			partials: [
				'MESSAGE',
				'CHANNEL',
				'REACTION'
			],
			ws: {
				intents: Intents.NON_PRIVILEGED,
			}
		});
		
		(async () => {
			/** The global bot configuration */
			this.config = config;

			/** A sequelize instance */
			this.db = await require('./database')(log), // this.db.models.Ticket...

			/** A leekslazylogger instance */
			this.log = log;

			/** An @eartharoid/i18n instance */
			this.i18n = new I18n(path('./src/locales'), 'en-GB');

			this.setMaxListeners(this.config.max_listeners); // set the max listeners for each event
	
			require('./updater')(this); // check for updates
			require('./modules/listeners')(this); // load internal listeners

			/** The command manager, used by internal and plugin commands */
			this.commands = new CommandManager(this);
			this.commands.load(); // load internal commands

			/** The plugin manager */
			this.plugins = new PluginManager(this);
			this.plugins.load(); // load plugins

			this.log.info('Connecting to Discord API...');

			this.login();
		})();
	}

}

new Bot();

const { version } = require('../package.json');
process.on('unhandledRejection', error => {
	log.notice('PLEASE INCLUDE THIS INFORMATION:');
	log.warn(`Discord Tickets v${version}, Node v${process.versions.node} on ${process.platform}`);
	log.warn('An error was not caught');
	if (error instanceof Error) log.warn(`Uncaught ${error.name}: ${error}`);
	log.error(error);
});

