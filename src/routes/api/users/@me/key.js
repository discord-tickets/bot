module.exports.get = fastify => ({
	handler: async function (req, res) { // MUST NOT use arrow function syntax
		if (process.env.PUBLIC_BOT === 'true') {
			return res.code(400).send({
				error: 'Bad Request',
				message: 'API keys are not available on public bots.',
				statusCode: 400,
			});
		} else {
			return {
				token: this.jwt.sign({
					createdAt: Date.now(),
					id: req.user.id,
				}),
			};
		}
	},
	onRequest: [fastify.authenticate],
});
