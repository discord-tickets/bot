const { PermissionsBitField } = require('discord.js');

module.exports.get = fastify => ({
	handler: async req => {
		/** @type {import('client')} */
		const client = req.routeOptions.config.client;
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

			if (process.env.PUBLIC_BOT !== 'true' && client.application.botPublic) {
				problems.push({ id: 'botPublic' });
			}
		}

		return problems;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});
