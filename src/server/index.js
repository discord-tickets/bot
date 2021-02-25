const { Plugin } = require('../modules/plugins');
const fastify = require('fastify')();

module.exports = class SettingsServer extends Plugin {
	constructor(client){
		super(client, {
			id: 'internal.settings'
		}, {
			name: 'Settings server',
			commands: []
		});

		this.client.plugins.plugins.set(this.id, this);
		this.preload();
	}

	async preload() {
		fastify.register(this.client.log.fastify, {
			type: 'http'
		});
	}

	async load() {
		fastify.listen(process.env.HTTP_PORT || 8080, (err, address) => {
			if (err) throw err;
			this.client.log.info(`Settings server listening at ${address}`);
		});

		fastify.get('/', async (req, res) => {
			res.type('application/json').code(200);
			return { hello: 'world' };
		});
	}
};