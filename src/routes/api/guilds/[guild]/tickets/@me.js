module.exports.get = fastify => ({
	handler: async (req, res) => {
		const { client } = req.routeOptions.config;
		/** @type {import("@prisma/client").PrismaClient} */
		const prisma  = client.prisma;
		const guild = client.guilds.cache.get(req.params.guild);
		res.send(
			await prisma.ticket.findMany({
				where: {
					createdById: req.user.id,
					guildId: guild.id,
				},
			}),
		);
	},
	onRequest: [fastify.authenticate, fastify.isMember],
});

