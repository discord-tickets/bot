const fastify = require('fastify')();
const oauth = require('@fastify/oauth2');
// const { randomBytes } = require('crypto');
const { short } = require('leeks.js');
const { join } = require('path');
const { readFiles }  = require('node-dir');

module.exports = client => {

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
		// secret: randomBytes(16).toString('hex'),
		secret: process.env.DB_ENCRYPTION_KEY,
	});

	// auth
	fastify.decorate('authenticate', async (req, res) => {
		try {
			const data = await req.jwtVerify();
			if (data.payload.expiresAt < Date.now()) res.redirect('/auth/login');
		} catch (err) {
			res.send(err);
		}
	});

	fastify.decorate('isAdmin', async (req, res) => {
		try {
			const userId = req.user.payload.id;
			const guildId = req.params.guild;
			const guild = client.guilds.cache.get(guildId);
			const guildMember = await guild.members.fetch(userId);
			const isAdmin = guildMember.permissions.has('MANAGE_GUILD');

			if (!isAdmin) {
				return res.code(401).send({
					error: 'Unauthorised',
					message: 'User is not authorised for this action',
					statusCode: 401,

				});
			}
		} catch (err) {
			res.send(err);
		}
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
		let response_time = res.getResponseTime().toFixed(2);
		response_time = (response_time >= 20
			? '&c'
			: response_time >= 5
				? '&e'
				: '&a') + response_time + 'ms';
		client.log.info.http(short(`${req.ip} ${req.method} ${req.routerPath ?? '*'} &m-+>&r ${status}&b in ${response_time}`));
		done();
	});

	fastify.addHook('onError', async (req, res, err) => client.log.error.http(err));

	// route loading
	const dir = join(__dirname, '/routes');

	readFiles(dir,
		{
			exclude: /^\./,
			match: /.js$/,
		},
		(err, content, next) => next(),
		(err, files) => {
			if (err) throw err;

			for (const file of files) {
				const path = file
					.substring(0, file.length - 3) // remove `.js`
					.substring(dir.length) // remove higher directories
					.replace(/\[(\w+)\]/gi, ':$1') // convert [] to :
					.replace('/index', '') || '/'; // remove index
				const route = require(file);

				Object.keys(route).forEach(method => fastify.route({
					config: { client },
					method: method.toUpperCase(),
					path,
					...route[method](fastify),
				})); // register route
			}

			// start server
			fastify.listen(process.env.HTTP_BIND, (err, addr) => {
				if (err) client.log.error.http(err);
				else client.log.success.http(`Listening at ${addr}`);
			});
		},
	);
};