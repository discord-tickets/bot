module.exports.get = fastify => ({
	handler: req => req.user.payload,
	onRequest: [fastify.authenticate],
});