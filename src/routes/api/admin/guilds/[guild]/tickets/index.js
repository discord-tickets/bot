const { pools } = require('../../../../../../lib/threads');
const { crypto } = pools;

module.exports.get = fastify => ({
	handler: async req => {
		/** @type {import('client')} */
		const client = req.routeOptions.config.client;
		const { query } = req;
		// TODO: advanced filters
		const tickets = await client.prisma.ticket.findMany({
			orderBy: { createdAt: 'asc' },
			where: {
				createdAt: { gte: query.since && new Date((Number(query.since) * 1000) || query.since) },
				guildId: req.params.guild,
			},
		});
		return Promise.all(
			tickets.map(async ticket => {
				ticket.closedReason &&= await crypto.queue(w => w.decrypt(ticket.closedReason));
				ticket.topic &&= await crypto.queue(w => w.decrypt(ticket.topic));
				return ticket;
			}),
		);
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});

