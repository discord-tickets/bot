const { iconURL } = require('../../../../lib/misc');

module.exports.get = fastify => ({
	handler: async (req, res) => {
		const { client } = req.routeOptions.config;
		const guild = client.guilds.cache.get(req.params.guild);
		if (!guild) return res.status(404).send(new Error('Not Found'));
		res.send({
			id: guild.id,
			logo: iconURL(guild),
			name: guild.name,
		});
	},
	onRequest: [fastify.authenticate],
});

