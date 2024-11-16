const { getPrivilegeLevel } = require('../../../../lib/users');
const { iconURL } = require('../../../../lib/misc');

module.exports.get = fastify => ({
	handler: async (req, res) => {
		const { client } = req.routeOptions.config;
		const guild = client.guilds.cache.get(req.params.guild);
		res.send({
			id: guild.id,
			logo: iconURL(guild),
			name: guild.name,
			privilegeLevel: await getPrivilegeLevel(await guild.members.fetch(req.user.id)),
		});
	},
	onRequest: [fastify.authenticate, fastify.isMember],
});

