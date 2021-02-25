const { Plugin } = require('../modules/plugins');

module.exports = class SettingsServer extends Plugin {
	constructor(client){
		super(client, {
			id: 'internal.settings'
		}, {
			name: 'Settings server',
			commands: []
		});

		this.fastify = require('fastify')();

		this.client.plugins.plugins.set(this.id, this);
		this.preload();
	}

	async preload() {
		this.fastify.register(this.client.log.fastify, {
			type: 'http'
		});
	}

	async load() {
		this.fastify.listen(process.env.HTTP_PORT || 8080, (err, address) => {
			if (err) throw err;
			this.client.log.info(`Settings server listening at ${address}`);
		});

		this.fastify.get('/', async (req, res) => {
			res.type('application/json').code(200);
			return { hello: 'world' };
		});
	}
};