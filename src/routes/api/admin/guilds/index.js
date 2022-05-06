module.exports.get = fastify => ({
	handler: async (req, res) => {
		const { client } = res.context.config;
		const user = await client.users.fetch(req.user.payload.id);
		console.log(req.user.payload.username, user?.tag);
		res.send(client.guilds.cache);
	},
	onRequest: [fastify.authenticate],
});