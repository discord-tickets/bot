const ms = require('ms');
const { logAdminEvent } = require('../../../../../../lib/logging');

module.exports.delete = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = res.context.config.client;
		const guildId = req.params.guild;
		const tagId = Number(req.params.tag);
		const original = tagId && await client.prisma.tag.findUnique({ where: { id: tagId } });
		if (original.guildId !== guildId) return res.status(404).send(new Error('Not Found'));
		const tag = await client.prisma.tag.delete({ where: { id: tagId } });

		const cacheKey = `cache/guild-tags:${guildId}`;
		client.keyv.set(cacheKey, await client.prisma.tag.findMany({
			select: {
				content: true,
				id: true,
				name: true,
				regex: true,
			},
			where: { guildId: guildId },
		}), ms('1h'));

		logAdminEvent(client, {
			action: 'delete',
			guildId: req.params.guild,
			target: {
				id: tag.id,
				name: tag.name,
				type: 'tag',
			},
			userId: req.user.id,
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

module.exports.patch = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = res.context.config.client;
		const guildId = req.params.guild;
		const tagId = Number(req.params.tag);
		const guild = client.guilds.cache.get(req.params.guild);
		const data = req.body;

		const original = req.params.tag && await client.prisma.tag.findUnique({ where: { id: tagId } });

		if (!original || original.guildId !== guildId) return res.status(404).send(new Error('Not Found'));

		if (data.hasOwnProperty('id')) delete data.id;
		if (data.hasOwnProperty('createdAt')) delete data.createdAt;

		const tag = await client.prisma.tag.update({
			data,
			where: { id: tagId },
		});

		const cacheKey = `cache/guild-tags:${guildId}`;
		client.keyv.set(cacheKey, await client.prisma.tag.findMany({
			select: {
				content: true,
				id: true,
				name: true,
				regex: true,
			},
			where: { guildId: guildId },
		}), ms('1h'));

		logAdminEvent(client, {
			action: 'update',
			diff: {
				original,
				updated: tag,
			},
			guildId: guild.id,
			target: {
				id: tag.id,
				name: tag.name,
				type: 'tag',
			},
			userId: req.user.id,
		});

		return tag;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});
