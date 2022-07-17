const { Client: FrameworkClient }= require('@eartharoid/dbf');
const { Intents } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const Keyv = require('keyv');
const I18n = require('@eartharoid/i18n');
const fs = require('fs');
const { join } = require('path');
const YAML = require('yaml');
const middleware = require('./lib/prisma');

module.exports = class Client extends FrameworkClient {
	constructor(config, log) {
		super({
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MEMBERS,
				Intents.FLAGS.GUILD_MESSAGES,
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
		this.config = config;
		this.log = log;
	}

	async login(token) {
		/** @type {PrismaClient} */
		this.prisma = new PrismaClient();
		this.prisma.$use(middleware(this.log));
		this.keyv = new Keyv();
		return super.login(token);
	}

	async destroy() {
		await this.prisma.$disconnect();
		return super.destroy();
	}
};