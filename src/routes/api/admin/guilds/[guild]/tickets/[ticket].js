const { pools } = require('../../../../../../lib/threads');
const { export: pool } = pools;

module.exports.get = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = req.routeOptions.config.client;
		const guildId = req.params.guild;
		const ticketId = req.params.ticket;
		const ticket = await client.prisma.ticket.findUnique({
			include: {
				archivedChannels: true,
				archivedMessages: true,
				archivedRoles: true,
				archivedUsers: true,
				feedback: true,
				questionAnswers: true,
			},
			where: {
				guildId, // ! prevent unauthorised access
				id: ticketId,
			},
		});

		if (!ticket) return res.status(404).send(new Error('Not Found'));

		res.header('Content-Type', 'application/json'); // exportTicket returns stringified JSON
		return await pool.queue(w => w.exportTicket(ticket));
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});
