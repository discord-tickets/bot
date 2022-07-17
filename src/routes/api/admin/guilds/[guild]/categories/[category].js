const { logAdminEvent } = require('../../../../../../lib/logging');

module.exports.get = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = res.context.config.client;

		const category = await client.prisma.category.findUnique({
			include: {
				questions: {
					select: {
						createdAt: true,
						id: true,
						label: true,
						maxLength: true,
						minLength: true,
						order: true,
						placeholder: true,
						required: true,
						style: true,
						value: true,
					},
				},
			},
			where: { id: Number(req.params.category)  },
		});

		return category;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});

module.exports.patch = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = res.context.config.client;

		const user = await client.users.fetch(req.user.payload.id);
		const guild = client.guilds.cache.get(req.params.guild);
		const data = req.body;
		const allow = ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES'];
		const original = req.params.category && await client.prisma.category.findUnique({ where: { id: req.params.category } });
		if (!original) return res.status(404);

		if (!data.discordCategory) {
			const channel = await guild.channels.create(data.name, {
				permissionOverwrites: [
					...[
						{
							deny: ['VIEW_CHANNEL'],
							id: guild.roles.everyone,
						},
						{
							allow: allow,
							id: client.user.id,
						},
					],
					...data.staffRoles.map(id => ({
						allow: allow,
						id,
					})),
				],
				position: 1,
				reason: `Tickets category created by ${user.tag}`,
				type: 'GUILD_CATEGORY',
			});
			data.discordCategory = channel.id;
		}

		const category = await client.prisma.category.update({
			data: {
				guild: { connect: { id: guild.id } },
				...data,
				questions: {
					upsert: data.questions?.map(q => ({
						create: q,
						update: q,
						where: { id: q.id },
					})),
				},
			},
		});

		logAdminEvent(client, {
			action: 'update',
			diff: {
				original,
				updated: category,
			},
			guildId: guild.id,
			target: {
				id: category.id,
				name: category.name,
				type: 'category',
			},
			userId: req.user.payload.id,
		});

		return category;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});