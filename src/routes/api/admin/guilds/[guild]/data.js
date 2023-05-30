module.exports.get = fastify => ({
	handler: async (req, res) => {
		/** @type {import('client')} */
		const client = res.context.config.client;
		const id = req.params.guild;
		const guild = client.guilds.cache.get(id) ?? {};
		const { query } = req.query;
		if (!query) return {};
		const data = query.split(/\./g).reduce((acc, part) => acc && acc[part], guild);
		return data;
	},
	onRequest: [fastify.authenticate, fastify.isAdmin],
});
