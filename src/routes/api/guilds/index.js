const { getPrivilegeLevel } = require('../../../lib/users');
const { iconURL } = require('../../../lib/misc');

module.exports.get = fastify => ({
	handler: async (req, res) => {
		const { client } = req.routeOptions.config;
		const guilds = await (await fetch('https://discordapp.com/api/users/@me/guilds', { headers: { 'Authorization': `Bearer ${req.user.accessToken}` } })).json();
		res.send(
			await Promise.all(
				guilds
					.filter(partialGuild => client.guilds.cache.has(partialGuild.id))
					.map(async partialGuild => {
						const guild = client.guilds.cache.get(partialGuild.id);
						return {
							id: guild.id,
							logo: iconURL(guild),
							name: guild.name,
							privilegeLevel: await getPrivilegeLevel(await guild.members.fetch(req.user.id)),
						};
					}),
			),
		);
	},
	onRequest: [fastify.authenticate],
});
