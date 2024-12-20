const { FrameworkClient } = require('@eartharoid/dbf');
const {
	GatewayIntentBits,
	Partials,
} = require('discord.js');
const logger = require('./lib/logger');
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
	constructor() {
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
				shards: 'auto',
			},
			{ baseDir: __dirname },
		);

		this.config = {};
		this.log = {};
		this.init();
	}

	async init(reload = false) {
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

		// to maintain references, these shouldn't be reassigned
		Object.assign(this.config, YAML.parse(fs.readFileSync('./user/config.yml', 'utf8')));
		Object.assign(this.log, logger(this.config));

		this.banned_guilds = new Set(
			(() => {
				let array = fs.readFileSync('./user/banned-guilds.txt', 'utf8').trim().split(/\r?\n/);
				if (array[0] === '') array = [];
				return array;
			})(),
		);
		this.log.info(`${this.banned_guilds.size} guilds are banned`);

		if (reload) {
			await this.initAfterLogin();
		} else {
			this.keyv = new Keyv();

			this.tickets = new TicketManager(this);

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
	}

	async initAfterLogin() {
		for (const id of this.banned_guilds) {
			if (this.guilds.cache.has(id)) {
				this.log.info(`Leaving banned guild ${id}`);
				await this.guilds.cache.get(id).leave();
			}
		}
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
			prisma_options.datasources = { db: { url: 'file:' + join(process.cwd(), './user/database.db') } };
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
