const fs = require('fs');
const { path } = require('../utils/fs');

module.exports = () => {
	const files = fs.readdirSync(path('./src/structures'))
		.filter(file => file.endsWith('.js'));

	for (const file of files) require(`../structures/${file}`);
};