const { FrameworkClient } = require('@eartharoid/dbf');
const {
	GatewayIntentBits, Partials,
} = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const Keyv = require('keyv');
const I18n = require('@eartharoid/i18n');
const fs = require('fs');
const { join } = require('path');
const YAML = require('yaml');
const TicketManager = require('./lib/tickets/manager');
const sqliteMiddleware = require('./lib/middleware/prisma-sqlite');

module.exports = class Client extends FrameworkClient {
	constructor(config, log) {
		super({
			intents: [
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.DirectMessageReactions,
				GatewayIntentBits.DirectMessageTyping,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildMessages,
			],
			partials: [
				Partials.Message,
				Partials.Channel,
				Partials.Reaction,
			],
		});

		const locales = {};
		fs.readdirSync(join(__dirname, 'i18n'))
			.filter(file => file.endsWith('.yml'))
			.forEach(file => {
				const data = fs.readFileSync(join(__dirname, 'i18n/' + file), { encoding: 'utf8' });
				const name = file.slice(0, file.length - 4);
				locales[name] = YAML.parse(data);
			});

		/** @type {I18n} */
		this.i18n = new I18n('en-GB', locales);
		/** @type {TicketManager} */
		this.tickets = new TicketManager(this);
		this.config = config;
		this.log = log;
		this.supers = (process.env.SUPER ?? '').split(',');
	}

	async login(token) {
		/** @type {PrismaClient} */
		this.prisma = new PrismaClient();
		if (process.env.DB_PROVIDER === 'sqlite') this.prisma.$use(sqliteMiddleware);
		this.keyv = new Keyv();
		return super.login(token);
	}

	async destroy() {
		await this.prisma.$disconnect();
		return super.destroy();
	}
};