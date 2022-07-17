const { logAdminEvent } = require('../../../../../lib/logging.js');

module.exports.delete = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = res.context.config.client;
		const id = req.params.guild;
		await client.prisma.guild.delete({ where: { id } });
		const settings = await client.prisma.guild.create({ data: { id } });
		logAdminEvent(client, {
			action: 'delete',
			guildId: id,
			target: {
				id,
				name: client.guilds.cache.get(id),
				type: 'settings',
			},
			userId: req.user.payload.id,
		});
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
		if (req.body.hasOwnProperty('id')) delete req.body.id;
		if (req.body.hasOwnProperty('createdAt')) delete req.body.createdAt;
		/** @type {import('client')} */
		const client = res.context.config.client;
		const id = req.params.guild;
		const original = await client.prisma.guild.findUnique({ where: { id } });
		const settings = await client.prisma.guild.update({
			data: req.body,
			where: { id },
		});
		logAdminEvent(client, {
			action: 'update',
			diff: {
				original,
				updated: settings,
			},
			guildId: id,
			target: {
				id,
				name: client.guilds.cache.get(id),
				type: 'settings',
			},
			userId: req.user.payload.id,
		});
		return settings;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});