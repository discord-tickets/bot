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

const { version } = require('../package.json');
const fs = require('fs');
const { path } = require('./utils/fs');

if (!fs.existsSync(path('./.env')))
	return console.log('Please make a copy of \'example.env\' called \'.env\'');
if (!fs.existsSync(path('./user/config.js')))
	return console.log('Please make a copy of \'user/example.config.js\' called \'user/config.js\'');

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
		/** The global bot configuration */
		this.config= config;
		/** A sequelize instance */
		this.db = require('./database')(log), // this.db.models.Ticket...
		/** A leekslazylogger instance */
		this.log = log;
		/** An @eartharoid/i18n instance */
		this.i18n = new I18n(path('./src/locales'), 'en-GB');
		
		// set the max listeners for each event to the number in the config
		this.setMaxListeners(this.config.max_listeners);

		// check for updates
		require('./updater')(this);
		// load internal listeners
		require('./modules/listeners')(this);

		/** The command manager, used by internal and plugin commands */
		this.commands = new CommandManager(this);
		/** The plugin manager */
		this.plugins = new PluginManager(this);
		// load plugins
		this.plugins.load();

		this.log.info('Connecting to Discord API...');

		this.login();
	}

}

new Bot();

process.on('unhandledRejection', error => {
	log.notice('PLEASE INCLUDE THIS INFORMATION:');
	log.warn(`Discord Tickets v${version}, Node v${process.versions.node} on ${process.platform}`);
	log.warn('An error was not caught');
	if (error instanceof Error) log.warn(`Uncaught ${error.name}: ${error}`);
	log.error(error);
});

