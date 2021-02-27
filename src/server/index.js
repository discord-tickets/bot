const { Plugin } = require('../modules/plugins');
const fastify = require('fastify');
const { randomBytes } = require('crypto');
const { path } = require('../utils/fs');

module.exports = class SettingsServer extends Plugin {
	constructor(client) {
		super(client, {
			id: 'internal.settings'
		}, {
			name: 'Settings server',
			commands: []
		});

		this.fastify = fastify();

		this.client.plugins.plugins.set(this.id, this);
		this.preload();
	}

	async preload() {
		this.fastify.register(this.client.log.fastify, {
			level: 'http',
			format: '{method} {status-colour}{status} &7{route} {time-colour}({time})'
		});

		this.fastify.register(require('fastify-secure-session'), {
			key: randomBytes(48).toString('hex')
		});

		this.fastify.register(require('fastify-static'), {
			root: path('./src/server/public'),
			prefix: '/public/',
		});
	}

	async load() {

		let host = process.env.HTTP_HOST;
		if (!host.endsWith('/')) host = host + '/';

		let redirect_url = encodeURI(`${host}auth/callback`);
		let oauth2_url = `https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&redirect_uri=${redirect_url}&response_type=code&scope=identify%20guilds&state=apollo`;

		this.fastify.get('/', async (req, res) => {
			// res.type('application/json').code(200);
			// return { hello: 'world' };
			res.code(200);
			return 'Hello!';
		});

		this.fastify.listen(process.env.HTTP_PORT || 8080, (err, host) => {
			if (err) throw err;
			this.client.log.info(`Settings server listening at ${host}`);
		});
	}
};