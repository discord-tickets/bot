const { logAdminEvent } = require('../../../../../../lib/logging');

module.exports.delete = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = res.context.config.client;
		const guildId = req.params.guild;
		const tagId = req.params.tag;
		const original = tagId && await client.prisma.tag.findUnique({ where: { id: tagId } });
		if (original.guildId !== guildId) return res.status(404).send(new Error('Not Found'));
		const tag = await client.prisma.tag.delete({ where: { id: tagId } });

		logAdminEvent(client, {
			action: 'delete',
			guildId: req.params.guild,
			target: {
				id: tag.id,
				name: tag.name,
				type: 'tag',
			},
			userId: req.user.payload.id,
		});

		return tag;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});

module.exports.get = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = res.context.config.client;
		const guildId = req.params.guild;
		const tagId = Number(req.params.tag);
		const tag = await client.prisma.tag.findUnique({ where: { id: tagId } });

		if (!tag || tag.guildId !== guildId) return res.status(404).send(new Error('Not Found'));

		return tag;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});