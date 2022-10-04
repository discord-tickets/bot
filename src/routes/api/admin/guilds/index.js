const { PermissionsBitField } = require('discord.js');

module.exports.get = fastify => ({
	handler: async (req, res) => {
		const { client } = res.context.config;
		const guilds = client.guilds.cache
			.filter(async guild => {
				const member = await guild.members.fetch(req.user.payload.id);
				if (!member) return false;
				return member.permissions.has(PermissionsBitField.Flags.ManageGuild);
			})
			.map(guild => ({
				id: guild.id,
				logo: guild.iconURL(),
				name: guild.name,
			}));
		res.send(guilds);
	},
	onRequest: [fastify.authenticate],
});