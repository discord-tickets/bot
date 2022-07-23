/* eslint-disable no-underscore-dangle */
const ms = require('ms');

module.exports.get = fastify => ({
	handler: async (req, res) => {
		/** @type {import("client")} */
		const client = res.context.config.client;
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
					createdAt: true,
					firstResponseAt: true,
				},
				where: { guildId: id },
			});
			cached = {
				createdAt: settings.createdAt,
				id: guild.id,
				logo: guild.iconURL(),
				name: guild.name,
				stats: {
					avgResponseTime: ms(tickets.reduce((total, ticket) => total + (ticket.firstResponseAt - ticket.createdAt), 0) ?? 1 / tickets.length),
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