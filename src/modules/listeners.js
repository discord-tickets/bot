const fs = require('fs');
const { path } = require('../utils/fs');

module.exports = client => {
	const files = fs.readdirSync(path('./src/listeners'))
		.filter(file => file.endsWith('.js'));

	for (const file of files) {
		const listener = require(`../listeners/${file}`);
		const exec = (...args) => listener.execute(client, ...args);
		let on = listener.once ? 'once' : 'on';
		if (listener.raw)
			client.ws[on](listener.event, exec);
		else
			client[on](listener.event, exec);
	}
};