/* eslint-disable no-underscore-dangle */
const { logAdminEvent } = require('../../../../../lib/logging.js');
const { iconURL } = require('../../../../../lib/misc');
const {
	getAverageTimes, getAverageRating,
} = require('../../../../../lib/stats');
const ms = require('ms');

module.exports.delete = fastify => ({
	handler: async req => {
		/** @type {import('client')} */
		const client = req.routeOptions.config.client;
		const id = req.params.guild;
		client.keyv.delete(`cache/stats/guild:${id}`);
		await client.prisma.$transaction([
			client.prisma.guild.delete({ where: { id } }),
			client.prisma.guild.create({ data: { id } }),
		]);
		logAdminEvent(client, {
			action: 'delete',
			guildId: id,
			target: {
				id,
				name: client.guilds.cache.get(id),
				type: 'settings',
			},
			userId: req.user.id,
		});
		return true;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});

module.exports.get = fastify => ({
	handler: async req => {
		/** @type {import("client")} */
		const client = req.routeOptions.config.client;
		const id = req.params.guild;
		const cacheKey = `cache/stats/guild:${id}`;
		let cached = await client.keyv.get(cacheKey);

		if (!cached) {
			const guild = client.guilds.cache.get(id);
			const settings =
				await client.prisma.guild.findUnique({ where: { id } }) ??
				await client.prisma.guild.create({ data: { id } });
			const [
				categories,
				tags,
				tickets,
				closedTickets,
			] = await Promise.all([
				client.prisma.category.findMany({
					select: {
						_count: { select: { tickets: true } },
						id: true,
						name: true,
					},
					where: { guildId: id },
				}),
				client.prisma.tag.count({ where: { guildId: id } }),
				client.prisma.ticket.count({ where: { guildId: id } }),
				client.prisma.ticket.findMany({
					select: {
						closedAt: true,
						createdAt: true,
						feedback: { select: { rating: true } },
						firstResponseAt: true,
					},
					where: {
						firstResponseAt: { not: null },
						guildId: id,
						open: false,
					},
				}),
				client.prisma.user.aggregate({
					_count: true,
					_sum: { messageCount: true },
				}),
			]);
			const {
				avgResolutionTime,
				avgResponseTime,
			} = await getAverageTimes(closedTickets);
			const avgRating = await getAverageRating(closedTickets);

			cached = {
				createdAt: settings.createdAt,
				id: guild.id,
				logo: iconURL(guild),
				name: guild.name,
				stats: {
					avgRating: avgRating.toFixed(1),
					avgResolutionTime: ms(avgResolutionTime),
					avgResponseTime: ms(avgResponseTime),
					categories: categories.map(c => ({
						id: c.id,
						name: c.name,
						tickets: c._count.tickets,
					})),
					tags,
					tickets,
				},
			};
			await client.keyv.set(cacheKey, cached, ms('5m'));
		}

		return cached;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});
