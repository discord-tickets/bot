module.exports.get = () => ({
	handler: async (req, res) => {
		const { client } = req.routeOptions.config;
		res
			.code(client.ws.status === 0 ? 200 : 503)
			.send({
				ping: client.ws.ping,
				shards: client.ws.shards.map(shard => ({
					id: shard.id,
					ping: shard.ping,
					status: shard.status,
				})),
				status: client.ws.status,
			});
	},
});
