module.exports.get = fastify => ({
	handler: req => req.user,
	onRequest: [fastify.authenticate],
});
