const { iconURL } = require('../../../lib/misc');

module.exports.get = fastify => ({
	handler: async (req, res) => {
		const { client } = req.routeOptions.config;
		const guilds = await (await fetch('https://discordapp.com/api/users/@me/guilds', { headers: { 'Authorization': `Bearer ${req.user.accessToken}` } })).json();
		res.send(
			guilds
				.filter(guild => client.guilds.cache.has(guild.id))
				.map(guild => ({
					id: guild.id,
					logo: iconURL(client.guilds.cache.get(guild.id)),
					name: guild.name,
				})),
		);
	},
	onRequest: [fastify.authenticate],
});
