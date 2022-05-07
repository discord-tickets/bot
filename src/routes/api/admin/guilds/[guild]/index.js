module.exports.get = fastify => ({
	handler: async (req, res) => {
		/** @type {import('../../../../../client')} */
		const client = res.context.config.client;

		const settings = await client.prisma.guild.findUnique({ where: { id: req.params.guild } }) ??
			await client.prisma.guild.create({ data: { id: req.params.guild } });
		res.send(settings);
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});