/* eslint-disable no-underscore-dangle */
const { logAdminEvent } = require('../../../../../lib/logging.js');
const { iconURL } = require('../../../../../lib/misc');
const {
	getAvgResolutionTime,
	getAvgResponseTime,
} = require('../../../../../lib/stats');
const ms = require('ms');

module.exports.delete = fastify => ({
	handler: async req => {
		/** @type {import('client')} */
		const client = req.routeOptions.config.client;
		const id = req.params.guild;
		await client.prisma.guild.delete({ where: { id } });
		await client.prisma.guild.create({ data: { id } });
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
			const settings = await client.prisma.guild.findUnique({ where: { id } }) ??
				await client.prisma.guild.create({ data: { id } });
			const categories = await client.prisma.category.findMany({
				select: {
					_count: { select: { tickets: true } },
					id: true,
					name: true,
				},
				where: { guildId: id },
			});
			const tickets = await client.prisma.ticket.findMany({
				select: {
					closedAt: true,
					createdAt: true,
					firstResponseAt: true,
				},
				where: { guildId: id },
			});
			const closedTickets = tickets.filter(t => t.firstResponseAt && t.closedAt);
			cached = {
				createdAt: settings.createdAt,
				id: guild.id,
				logo: iconURL(guild),
				name: guild.name,
				stats: {
					avgResolutionTime: ms(getAvgResolutionTime(closedTickets)),
					avgResponseTime: ms(getAvgResponseTime(closedTickets)),
					categories: categories.map(c => ({
						id: c.id,
						name: c.name,
						tickets: c._count.tickets,
					})),
					tags: await client.prisma.tag.count({ where: { guildId: id } }),
					tickets: tickets.length,
				},
			};
			await client.keyv.set(cacheKey, cached, ms('5m'));
		}

		return cached;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});
