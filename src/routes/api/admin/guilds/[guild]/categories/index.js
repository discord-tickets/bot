const { logAdminEvent } = require('../../../../../../lib/logging');
const {
	updateCommandPermissions,
	updateStaffRoles,
} = require('../../../../../../lib/users');
const emoji = require('node-emoji');
const { ChannelType: { GuildCategory } } = require('discord.js');
const ms = require('ms');
const {
	getAverageTimes, getAverageRating,
} = require('../../../../../../lib/stats');

module.exports.get = fastify => ({
	handler: async req => {
		/** @type {import('client')} */
		const client = req.routeOptions.config.client;

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
						tickets: {
							select: {
								closedAt: true,
								createdAt: true,
							    feedback: { select: { rating: true } },
								firstResponseAt: true,
							},
							where: {
								firstResponseAt: { not: null },
								open: false,
							},
						},
					},
				},
			},
			where: { id: req.params.guild },
		});

		categories = await Promise.all(
			categories.map(async category => {
				const {
					avgResolutionTime,
					avgResponseTime,
				} = await getAverageTimes(category.tickets);
				const avgRating = await getAverageRating(category.tickets);
				category = {
					...category,
					stats: {
						avgRating: avgRating.toFixed(1),
						avgResolutionTime: ms(avgResolutionTime),
						avgResponseTime: ms(avgResponseTime),
					},
				};
				delete category.tickets;
				return category;
			}),
		);

		return categories;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});

module.exports.post = fastify => ({
	handler: async req => {
		/** @type {import('client')} */
		const client = req.routeOptions.config.client;

		const user = await client.users.fetch(req.user.id);
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
				...data,
				guild: { connect: { id: guild.id } },
				questions: { createMany: { data: data.questions ?? [] } },
			},
		});

		// update caches
		await client.tickets.getCategory(category.id, true);
		const staffRoles = await updateStaffRoles(guild);

		if (req.user.accessToken) {
			updateCommandPermissions(guild, req.user.accessToken, staffRoles);
		}

		logAdminEvent(client, {
			action: 'create',
			guildId: guild.id,
			target: {
				id: category.id,
				name: category.name,
				type: 'category',
			},
			userId: req.user.id,
		});

		return category;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});
