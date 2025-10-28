const { PermissionsBitField } = require('discord.js');
const { iconURL } = require('../../../../lib/misc');

module.exports.get = fastify => ({
	handler: async (req, res) => {
		const { client } = req.routeOptions.config;
		const guilds = await (await fetch('https://discordapp.com/api/users/@me/guilds', { headers: { 'Authorization': `Bearer ${req.user.accessToken}` } })).json();
		res.send(
			guilds
				.filter(guild => guild.owner || new PermissionsBitField(guild.permissions.toString()).has(PermissionsBitField.Flags.ManageGuild))
				.map(guild => ({
					added: client.guilds.cache.has(guild.id),
					id: guild.id,
					logo: iconURL(
						client.guilds.cache.get(guild.id) ||
						{
							client,
							icon: guild.icon,
							id: guild.id,
						},
					),
					name: guild.name,
				})),
		);
	},
	onRequest: [fastify.authenticate],
});
