const fastify = require('fastify')();
const { short } = require('leeks.js');
const { join } = require('path');
const { readFiles }  = require('node-dir');

module.exports = client => {
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
	});

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

				Object.keys(route).forEach(method => fastify[method](path, {
					config: { client },
					...route[method],
				})); // register route
			}

			fastify.listen(process.env.HTTP_BIND, (err, addr) => {
				if (err) client.log.error.http(err);
				else client.log.success.http(`Listening at ${addr}`);
			});
		},
	);
};