module.exports.get = () => ({
	handler: async (req, res) => {
		const { status } = req.routeOptions.config.client.ws;
		res.code(status === 0 ? 200 : 503).send(status);
	},
});
