/**
 * Discord Tickets
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
 * @name @discord-tickets/bot
 * @description An open-source Discord bot for ticket management
 * @copyright 2021 Isaac Saunders
 * @license GNU-GPLv3
 */

/* eslint-disable no-console */

process.title = 'Discord Tickets';

const min_node_version = '16.6.0';
const semver = require('semver');
if (semver.lt(process.versions.node, min_node_version)) return console.log(`\x07Error: Discord Tickets does not work on Node v${process.versions.node}; please upgrade to v${min_node_version} or above.`);

const leeks = require('leeks.js');
const fs = require('fs');
const { path } = require('./utils/fs');

const checkFile = (file, example) => {
	if (fs.existsSync(path(file))) return true;
	if (!fs.existsSync(path(example))) {
		console.log(`\x07Error: "${file}" not found, and unable to create it due to "${example}" being missing.`);
		return process.exit();
	}
	console.log(`Copying "${example}" to "${file}"...`);
	fs.copyFileSync(path(example), path(file));
	return false;
};

checkFile('./user/config.js', './user/example.config.js');

if (!checkFile('./.env', './example.env')) {
	console.log('Generating database encryption key...');

	const file = path('./.env');
	const crypto = require('crypto');

	const key = 'DB_ENCRYPTION_KEY=';
	const value = crypto
		.randomBytes(24)
		.toString('hex');

	let data = fs.readFileSync(file, { encoding: 'utf-8' });
	data = data.replace(key, key + value);

	fs.writeFileSync(file, data);

	console.log('Saved.');
	console.log(leeks.colours.yellow('Warning: do not lose your ENV file or encryption key; you will lose access to data in the database.'));
	console.log('\x07Please set your bot\'s "DISCORD_TOKEN" in "./.env".');

	process.exit();
}

require('dotenv').config({ path: path('./.env') });

require('./banner')();

const log = require('./logger');

const { version } = require('../package.json');
process.on('unhandledRejection', error => {
	log.notice('PLEASE INCLUDE THIS INFORMATION IF YOU ASK FOR HELP ABOUT THE FOLLOWING ERROR:');
	log.notice(`Discord Tickets v${version}, Node v${process.versions.node} on ${process.platform}`);
	log.warn('An error was not caught');
	if (error instanceof Error) log.warn(`Uncaught ${error.name}`);
	log.error(error);
});

const DiscordUtils = require('./utils/discord');
const Cryptr = require('cryptr');
const I18n = require('@eartharoid/i18n');
const ListenerLoader = require('./modules/listeners/loader');
const CommandManager = require('./modules/commands/manager');
const PluginManager = require('./modules/plugins/manager');
const TicketManager = require('./modules/tickets/manager');

const fetch = require('node-fetch');

const {
	Client,
	Intents
} = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Logger = require('leekslazylogger');

/**
 * The Discord client
 * @typedef {Bot} Bot
 * @extends {Client}
 */
class Bot extends Client {
	constructor() {
		super({
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MEMBERS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_MESSAGE_REACTIONS
			],
			partials: [
				'CHANNEL',
				'MESSAGE',
				'REACTION'
			],
			presence: DiscordUtils.selectPresence()
		});

		(async () => {
			this.version = version;

			/** The global bot configuration */
			this.config = require('../user/config');

			/**
			 * A [leekslazylogger](https://logger.eartharoid.me) instance
			 * @type {Logger}
			 */
			this.log = log;

			/**
			 * A [Cryptr](https://www.npmjs.com/package/cryptr) instance
			 * @type {Cryptr}
			 */
			this.cryptr = new Cryptr(process.env.DB_ENCRYPTION_KEY);

			const locales = {};
			fs.readdirSync(path('./src/locales'))
				.filter(file => file.endsWith('.json'))
				.forEach(file => {
					const data = fs.readFileSync(path(`./src/locales/${file}`), { encoding: 'utf8' });
					const name = file.slice(0, file.length - 5);
					locales[name] = JSON.parse(data);
				});

			/**
			 * An [@eartharoid/i18n](https://github.com/eartharoid/i18n) instance
			 * @type {I18n}
			 */
			this.i18n = new I18n('en-GB', locales);

			/** A sequelize instance */
			this.db = await require('./database')(this), // this.db.models.Ticket...

			this.setMaxListeners(this.config.max_listeners); // set the max listeners for each event

			require('./update/notifier')(this); // check for updates

			const listeners = new ListenerLoader(this);
			listeners.load(); // load listeners

			/** The ticket manager */
			this.tickets = new TicketManager(this);

			/** The command manager, used by internal and plugin commands */
			this.commands = new CommandManager(this);

			/** The plugin manager */
			this.plugins = new PluginManager(this);
			this.plugins.load(); // load plugins

			/** Some utility methods */
			this.utils = new DiscordUtils(this);

			this.log.info('Connecting to Discord API...');

			this.login();
		})();
	}

	async postStats() {
		/**
		 * OH NO, TELEMETRY!?
		 * Relax, it just counts how many people are using Discord Tickets.
		 * You can see the source here: https://github.com/discord-tickets/stats
		 */
		if (this.config.super_secret_setting) { // you can disable it if you really want
			const data = {
				client: this.user.id,
				guilds: this.guilds.cache.size,
				members: await this.guilds.cache.reduce(async (acc, guild) => await acc + (await guild.fetch()).approximateMemberCount, 0),
				tickets: await this.db.models.Ticket.count(),
				version: this.version
			};
			this.log.debug('Sending statistics', data);
			await fetch('https://stats.discordtickets.app/v2', {
				body: JSON.stringify(data),
				headers: { 'Content-Type': 'application/json' },
				method: 'POST'
			})
				.catch(error => {
					this.log.warn('Failed to send statistics');
					this.log.debug(error);
				});
		}
	}

	async timerFunction() {
		let ms = 10000;
		setInterval(async () => {
			console.log("Ticket Bot");
			const res = await this.db.query('SELECT * FROM dsctickets_tickets where last_message > (NOW() + INTERVAL 1 DAY)');
			if(res[0].length > 0) {
				res[0].forEach(async (result) => {
					const curr = this.channels.cache.get(result.id);
					if(curr) {
						this.tickets.close(result.id, this.user.id, result.guild, "");
						await this.users.fetch(result.creator).then((user) => {
							user.send(`Your ticket has been deleted.`);
						})
					}
				})
			}
		}, ms);
	}

}

new Bot();