const { logAdminEvent } = require('../../../../../../lib/logging');
const emoji = require('node-emoji');
const { ChannelType: { GuildCategory } } = require('discord.js');
const ms = require('ms');

module.exports.get = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = res.context.config.client;

		let { categories } = await client.prisma.guild.findUnique({
			select: {
				categories: {
					select: {
						createdAt: true,
						description: true,
						discordCategory: true,
						emoji: true,
						id: true,
						image: true,
						name: true,
						requiredRoles: true,
						staffRoles: true,
						tickets: true,
					},
				},
			},
			where: { id: req.params.guild },
		});

		categories = categories.map(c => {
			c = {
				...c,
				stats: {
					avgResolutionTime: ms(c.tickets.reduce((total, ticket) => total + (ticket.closedAt - ticket.createdAt), 0) ?? 1 / c.tickets.length),
					avgResponseTime: ms(c.tickets.reduce((total, ticket) => total + (ticket.firstResponseAt - ticket.createdAt), 0) ?? 1 / c.tickets.length),
				},
			};
			delete c.tickets;
			return c;
		});

		return categories;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});

module.exports.post = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = res.context.config.client;

		const user = await client.users.fetch(req.user.payload.id);
		const guild = client.guilds.cache.get(req.params.guild);
		const data = req.body;
		const allow = ['ViewChannel', 'ReadMessageHistory', 'SendMessages', 'EmbedLinks', 'AttachFiles'];

		if (!data.discordCategory) {
			let name = data.name;
			if (emoji.hasEmoji(data.emoji)) name = `${emoji.get(data.emoji)} ${name}`;
			const channel = await guild.channels.create({
				name,
				permissionOverwrites: [
					...[
						{
							deny: ['ViewChannel'],
							id: guild.roles.everyone,
						},
						{
							allow: allow,
							id: client.user.id,
						},
					],
					...data.staffRoles.map(id => ({
						allow: allow,
						id,
					})),
				],
				position: 1,
				reason: `Tickets category created by ${user.tag}`,
				type: GuildCategory,
			});
			data.discordCategory = channel.id;
		}

		data.channelName ||= 'ticket-{num}'; // not ??=, expect empty string

		const category = await client.prisma.category.create({
			data: {
				guild: { connect: { id: guild.id } },
				...data,
				questions: { createMany: { data: data.questions ?? [] } },
			},
		});

		logAdminEvent(client, {
			action: 'create',
			guildId: guild.id,
			target: {
				id: category.id,
				name: category.name,
				type: 'category',
			},
			userId: req.user.payload.id,
		});

		return category;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});