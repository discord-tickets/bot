const { PermissionsBitField } = require('discord.js');

module.exports.get = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = res.context.config.client;
		const id = req.params.guild;
		const guild = client.guilds.cache.get(id);
		const settings = await client.prisma.guild.findUnique({ where: { id } }) ??
			await client.prisma.guild.create({ data: { id } });
		const problems = [];

		if (settings.logChannel) {
			const permissions = guild.members.me.permissionsIn(settings.logChannel);

			if (!permissions.has(PermissionsBitField.Flags.SendMessages)) {
				problems.push({
					id: 'logChannelMissingPermission',
					permission: 'SendMessages',
				});
			}

			if (!permissions.has(PermissionsBitField.Flags.EmbedLinks)) {
				problems.push({
					id: 'logChannelMissingPermission',
					permission: 'EmbedLinks',
				});
			}
		}

		return problems;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});
