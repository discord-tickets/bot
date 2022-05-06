module.exports.get = fastify => ({
	handler: (req, res) => {
		const { client } = res.context.config;
		return client.guilds.cache.get(req.params.guild);
	},
	onRequest: [fastify.authenticate],
});