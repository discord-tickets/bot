const { FrameworkClient } = require('@eartharoid/dbf');
const {
	GatewayIntentBits,
	Partials,
} = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const Keyv = require('keyv');
const I18n = require('@eartharoid/i18n');
const fs = require('fs');
const { join } = require('path');
const YAML = require('yaml');
const TicketManager = require('./lib/tickets/manager');
const sqliteMiddleware = require('./lib/middleware/prisma-sqlite');
const ms = require('ms');

module.exports = class Client extends FrameworkClient {
	constructor(config, log) {
		super(
			{
				intents: [
					...[
						GatewayIntentBits.DirectMessages,
						GatewayIntentBits.DirectMessageReactions,
						GatewayIntentBits.DirectMessageTyping,
						GatewayIntentBits.MessageContent,
						GatewayIntentBits.Guilds,
						GatewayIntentBits.GuildMembers,
						GatewayIntentBits.GuildMessages,
					],
					...(process.env.PUBLIC_BOT !== 'true' ? [GatewayIntentBits.GuildPresences] : []),
				],
				partials: [
					Partials.Channel,
					Partials.Message,
					Partials.Reaction,
				],
			},
			{ baseDir: __dirname },
		);

		const locales = {};
		fs.readdirSync(join(__dirname, 'i18n'))
			.filter(file => file.endsWith('.yml'))
			.forEach(file => {
				const data = fs.readFileSync(join(__dirname, 'i18n/' + file), { encoding: 'utf8' });
				const name = file.slice(0, file.length - 4);
				locales[name] = YAML.parse(data);
			});

		this.keyv = new Keyv();
		/** @type {I18n} */
		this.i18n = new I18n('en-GB', locales);
		/** @type {TicketManager} */
		this.tickets = new TicketManager(this);
		this.config = config;
		this.log = log;
		this.supers = (process.env.SUPER ?? '').split(',');
		/** @param {import('discord.js/typings').Interaction} interaction */
		this.commands.interceptor = async interaction => {
			if (!interaction.inGuild()) return;
			const id = interaction.guildId;
			const cacheKey = `cache/known/guild:${id}`;
			if (await this.keyv.has(cacheKey)) return;
			await this.prisma.guild.upsert({
				create: {
					id,
					locale: this.i18n.locales.find(locale => locale === interaction.guild.preferredLocale), // undefined if not supported
				},
				update: {},
				where: { id },
			});
			await this.keyv.set(cacheKey, true);
		};
	}

	async login(token) {
		const levels = ['error', 'info', 'warn'];
		if (this.config.logs.level === 'debug') levels.push('query');

		const prisma_options = {
			log: levels.map(level => ({
				emit: 'event',
				level,
			})),
		};

		if (process.env.DB_PROVIDER === 'sqlite' && !process.env.DB_CONNECTION_URL) {
			prisma_options.datasources = { db: { url:'file:' + join(process.cwd(), './user/database.db') } };
		}

		/** @type {PrismaClient} */
		this.prisma = new PrismaClient(prisma_options);

		this.prisma.$on('error', e => this.log.error.prisma(`${e.target} ${e.message}`));
		this.prisma.$on('info', e => this.log.info.prisma(`${e.target} ${e.message}`));
		this.prisma.$on('warn', e => this.log.warn.prisma(`${e.target} ${e.message}`));
		this.prisma.$on('query', e => this.log.debug.prisma(e));

		if (process.env.DB_PROVIDER === 'sqlite') {
			// rewrite queries that use unsupported features
			this.prisma.$use(sqliteMiddleware);
			// make sqlite faster (missing parentheses are not a mistake, `$queryRaw` is a tagged template literal)
			this.log.debug(await this.prisma.$queryRaw`PRAGMA journal_mode=WAL;`); // https://www.sqlite.org/wal.html
			this.log.debug(await this.prisma.$queryRaw`PRAGMA synchronous=normal;`); // https://www.sqlite.org/pragma.html#pragma_synchronous

			setInterval(async () => {
				this.log.debug(await this.prisma.$queryRaw`PRAGMA optimize;`); // https://www.sqlite.org/pragma.html#pragma_optimize
			}, ms('6h'));
		}

		return super.login(token);
	}

	async destroy() {
		await this.prisma.$disconnect();
		return super.destroy();
	}
};
