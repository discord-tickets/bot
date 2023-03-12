const { PermissionsBitField } = require('discord.js');

module.exports.get = fastify => ({
	handler: async (req, res) => {
		const { client } = res.context.config;
		const guilds = await (await fetch('https://discordapp.com/api/users/@me/guilds', { headers: { 'Authorization': `Bearer ${req.user.accessToken}` } })).json();
		res.send(
			guilds
				.filter(guild => guild.owner || new PermissionsBitField(guild.permissions.toString()).has(PermissionsBitField.Flags.ManageGuild))
				.map(guild => ({
					added: client.guilds.cache.has(guild.id),
					id: guild.id,
					logo: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp`,
					name: guild.name,
				})),
		);
	},
	onRequest: [fastify.authenticate],
});
