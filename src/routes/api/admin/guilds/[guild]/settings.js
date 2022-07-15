module.exports.delete = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = res.context.config.client;
		const id = req.params.guild;
		await client.prisma.guild.delete({ where: { id } });
		const settings = await client.prisma.guild.create({ data: { id } });

		return settings;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});

module.exports.get = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = res.context.config.client;
		const id = req.params.guild;
		const settings = await client.prisma.guild.findUnique({ where: { id } }) ??
			await client.prisma.guild.create({ data: { id } });

		return settings;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});

module.exports.patch = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = res.context.config.client;
		const id = req.params.guild;
		const settings = await client.prisma.guild.update({
			data: req.body,
			where: { id },
		});

		return settings;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});