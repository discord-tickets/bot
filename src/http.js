const fastify = require('fastify')();
const { readFiles }  = require('node-dir');
const { join } = require('path');

module.exports = client => {
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