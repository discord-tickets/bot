import {
	container,
	SapphireClient
} from '@sapphire/framework';
import { Intents } from 'discord.js';
import prisma from '@prisma/client';

export default class Client extends SapphireClient {
	constructor() {
		super({
			defaultPrefix: 'tickets/',
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MEMBERS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_MESSAGE_REACTIONS
			],
		});
	}
	async login(token) {
		container.prisma = new prisma.PrismaClient();
		return super.login(token);
	}

	async destroy() {
		await container.prisma.$disconnect();
		return super.destroy();
	}


}