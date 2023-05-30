const ms = require('ms');
const { logAdminEvent } = require('../../../../../../lib/logging');

module.exports.get = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = res.context.config.client;

		const { tags } = await client.prisma.guild.findUnique({
			select: { tags: true },
			where: { id: req.params.guild },
		});

		return tags;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});


module.exports.post = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = res.context.config.client;
		const guild = client.guilds.cache.get(req.params.guild);
		const data = req.body;
		const tag = await client.prisma.tag.create({
			data: {
				guild: { connect: { id: guild.id } },
				...data,
			},
		});

		const cacheKey = `cache/guild-tags:${guild.id}`;
		let tags = await client.keyv.get(cacheKey);
		if (!tags) {
			tags = await client.prisma.tag.findMany({
				select: {
					content: true,
					id: true,
					name: true,
					regex: true,
				},
				where: { guildId: guild.id },
			});
			client.keyv.set(cacheKey, tags, ms('1h'));
		} else {
			tags.push(tag);
			client.keyv.set(cacheKey, tags, ms('1h'));
		}

		logAdminEvent(client, {
			action: 'create',
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
