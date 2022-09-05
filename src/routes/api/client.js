const ms = require('ms');
const { boolean } = require('boolean');

module.exports.get = () => ({
	handler: async (req, res) => {
		/** @type {import("client")} */
		const client = res.context.config.client;
		const cacheKey = 'cache/stats/client';
		let cached = await client.keyv.get(cacheKey);

		if (!cached) {
			const tickets = await client.prisma.ticket.findMany({
				select: {
					createdAt: true,
					firstResponseAt: true,
				},
			});
			const closedTickets = tickets.filter(t => t.closedAt);
			const users = await client.prisma.user.findMany({ select: { messageCount: true } });
			cached = {
				avatar: client.user.avatarURL(),
				discriminator: client.user.discriminator,
				id: client.user.id,
				portal: process.env.PORTAL || null,
				public: boolean(process.env.PUBLIC_BOT),
				stats: {
					activatedUsers: users.length,
					archivedMessages: users.reduce((total, user) => total + user.messageCount, 0), // don't count archivedMessage table rows, they can be deleted
					avgResolutionTime: ms(closedTickets.reduce((total, ticket) => total + (ticket.closedAt - ticket.createdAt), 0) ?? 1 / closedTickets.length),
					avgResponseTime: ms(closedTickets.reduce((total, ticket) => total + (ticket.firstResponseAt - ticket.createdAt), 0) ?? 1 / closedTickets.length),
					categories: await client.prisma.category.count(),
					guilds: client.guilds.cache.size,
					members: client.guilds.cache.reduce((t, g) => t + g.memberCount, 0),
					tags: await client.prisma.tag.count(),
					tickets: tickets.length,
				},
				username: client.user.username,
			};
			await client.keyv.set(cacheKey, cached, ms('15m'));
		}

		return cached;
	},
});