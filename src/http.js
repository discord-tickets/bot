const fastify = require('fastify')({ trustProxy: process.env.HTTP_TRUST_PROXY === 'true' });
const oauth = require('@fastify/oauth2');
const { domain } = require('./lib/http');
const { short } = require('leeks.js');
const { join } = require('path');
const { files } = require('node-dir');
const { PermissionsBitField } = require('discord.js');

process.env.PUBLIC_HOST = process.env.HTTP_EXTERNAL; // the SvelteKit app expects `PUBLIC_HOST`

module.exports = async client => {
	// cors plugin
	fastify.register(require('@fastify/cors'), {
		credentials: true,
		methods: ['DELETE', 'GET', 'PATCH', 'PUT', 'POST'],
		origin: true,
	});

	// oauth2 plugin
	fastify.register(oauth, {
		callbackUri: `${process.env.HTTP_EXTERNAL}/auth/callback`,
		credentials: {
			auth: oauth.DISCORD_CONFIGURATION,
			client: {
				id: client.user.id,
				secret: process.env.DISCORD_SECRET,
			},
		},
		name: 'discord',
		scope: ['identify'],
		startRedirectPath: '/auth/login',
	});

	// cookies plugin
	fastify.register(require('@fastify/cookie'));

	// jwt plugin
	fastify.register(require('@fastify/jwt'), {
		cookie: {
			cookieName: 'token',
			signed: false,
		},
		secret: process.env.ENCRYPTION_KEY,
	});

	// proxy `/settings` to express
	fastify.register(require('@fastify/http-proxy'), {
		http2: false,
		prefix: '/settings',
		replyOptions: {
			rewriteRequestHeaders: (req, headers) => ({
				...headers,
				'host': domain,
			}),
		},
		rewritePrefix: '/settings',
		upstream: `http://${process.env.SETTINGS_HOST}:${process.env.SETTINGS_PORT}`,
	});

	// auth
	fastify.decorate('authenticate', async (req, res) => {
		try {
			const data = await req.jwtVerify();
			if (data.payload.expiresAt < Date.now()) {
				return res.code(401).send({
					error: 'Unauthorised',
					message: 'You are not authenticated.',
					statusCode: 401,

				});
			}
		} catch (err) {
			res.send(err);
		}
	});

	fastify.decorate('isAdmin', async (req, res) => {
		try {
			const userId = req.user.payload.id;
			const guildId = req.params.guild;
			const guild = client.guilds.cache.get(guildId);
			if (!guild) {
				return res.code(404).send({
					error: 'Not Found',
					message: 'The requested resource could not be found.',
					statusCode: 404,

				});
			}
			const guildMember = await guild.members.fetch(userId);
			const isAdmin = guildMember?.permissions.has(PermissionsBitField.Flags.ManageGuild) || client.supers.includes(userId);
			if (!isAdmin) {
				return res.code(403).send({
					error: 'Forbidden',
					message: 'You are not permitted for this action.',
					statusCode: 403,

				});
			}
		} catch (err) {
			res.send(err);
		}
	});

	// body processing
	fastify.addHook('preHandler', (req, res, done) => {
		if (req.body && typeof req.body === 'object') {
			for (const prop in req.body) {
				if (typeof req.body[prop] === 'string') {
					req.body[prop] = req.body[prop].trim();
				}
			}
		}
		done();
	});

	// logging
	fastify.addHook('onResponse', (req, res, done) => {
		done();
		const status = (res.statusCode >= 500
			? '&4'
			: res.statusCode >= 400
				? '&6'
				: res.statusCode >= 300
					? '&3'
					: res.statusCode >= 200
						? '&2'
						: '&f') + res.statusCode;
		let responseTime = res.getResponseTime().toFixed(2);
		responseTime = (responseTime >= 20
			? '&c'
			: responseTime >= 5
				? '&e'
				: '&a') + responseTime + 'ms';
		const level = req.routerPath.startsWith('/settings') ? 'verbose' : 'info';
		client.log[level].http(short(`${req.id} ${req.ip} ${req.method} ${req.routerPath ?? '*'} &m-+>&r ${status}&b in ${responseTime}`));
		if (!req.routerPath) client.log.verbose.http(`${req.id} ${req.method} ${req.url}`);
		done();
	});

	fastify.addHook('onError', async (req, res, err) => client.log.error.http(req.id, err));

	// route loading
	const dir = join(__dirname, '/routes');
	files(dir, {
		exclude: /^\./,
		match: /.js$/,
		sync: true,
	}).forEach(file => {
		const path = file
			.substring(0, file.length - 3) // remove `.js`
			.substring(dir.length) // remove higher directories
			.replace(/\\/g, '/') // replace `\` with `/` because Windows is stupid
			.replace(/\[(\w+)\]/gi, ':$1') // convert [] to :
			.replace('/index', '') || '/'; // remove index
		const route = require(file);

		Object.keys(route).forEach(method => fastify.route({
			config: { client },
			method: method.toUpperCase(),
			path,
			...route[method](fastify),
		})); // register route
	});

	// express server for settings
	const express = require('express')();
	const { handler } = await import('@discord-tickets/settings/build/handler.js');
	express.set('trust proxy', true);
	express.use((req, res, next) => {
		next();
		client.log.verbose.http(short(`Express ${req.ip} ${req.method} ${req.route?.path ?? req.path}`));
	});
	express.use(handler); // let SvelteKit handle everything
	express.listen(process.env.SETTINGS_PORT, process.env.SETTINGS_HOST,  () => { // start the express server
		client.log.verbose.http(`Express listening on port ${process.env.SETTINGS_PORT}`);
	});

	// start the fastify server
	fastify.listen({
		host: process.env.HTTP_HOST,
		port: process.env.HTTP_PORT,
	}, (err, addr) => {
		if (err) client.log.error.http(err);
		else client.log.success.http(`Listening at ${addr}`);
	});
};