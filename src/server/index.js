const { Plugin } = require('../modules/plugins');
const fastify = require('fastify');
const session = require('fastify-secure-session');
const { randomBytes } = require('crypto');
const fs = require('fs');
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
		this.fastify.register(this.client.log.fastify(), {
			level: 'http',
			format: '&lSETTINGS:&r {status-colour}{status}&r {method} &7{route} {time-colour}({time})'
		});

		this.fastify.register(session, {
			secret: randomBytes(48).toString('hex'),
			salt: randomBytes(8).toString('hex'),
			cookie: {
				path: '/',
				httpOnly: true ,
			},
		});

		this.fastify.register(require('fastify-static'), {
			root: path('./src/server/public'),
			// prefix: '/public/',
		});

		let host = process.env.HTTP_HOST;
		if (!host.endsWith('/')) host = host + '/';
		this.redirect_uri = encodeURI(`${host}auth/callback`);
	}

	async load() {
		const routes = fs.readdirSync(path('./src/server/routes'))
			.filter(file => file.endsWith('.js'));
		for (const r of routes) {
			const {
				method,
				route,
				execute
			} = require(`./routes/${r}`);
			this.fastify[method](route, (...args) => execute(this, ...args));
		}

		this.fastify.listen(process.env.HTTP_PORT || 8080, (err, host) => {
			if (err) throw err;
			this.client.log.info(`Settings server listening at ${host}`);
		});

		this.io = require('socket.io')(process.env.HTTP_PORT || 8080);

		this.io.on('connection', socket => {
			const events = fs.readdirSync(path('./src/server/socket'))
				.filter(file => file.endsWith('.js'));
			for (const e of events) {
				const {
					event,
					execute
				} = require(`./socket/${e}`);
				socket.on(event, (...args) => execute(this, ...args));
			}
		});
	}
};