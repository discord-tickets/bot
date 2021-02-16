const fs = require('fs');
const { path } = require('../utils/fs');

module.exports = client => {
	const files = fs.readdirSync(path('./src/listeners'))
		.filter(file => file.endsWith('.js'));

	for (const file of files) {
		const listener = require(`../listeners/${file}`);
		client.on(listener.event, (...args) => listener.execute(client, ...args));
	}
};