const fs = require('fs');
const { path } = require('../utils/fs');
const FILE = path('./version');
const { version: current } = require('../../package.json');

/**
 * @param {import('../..').Bot} client
 */
module.exports = async client => {
	if (!fs.existsSync(FILE)) {
		return fs.writeFileSync(FILE, current);
	} else {
		const previous = fs.readFileSync(FILE, { encoding: 'utf8' });
		if (previous !== current) {
			client.log.info('Running upgrade task');
			client.log.info('Writing version');
			fs.writeFileSync(FILE, current);

			const guilds = await client.db.models.Guild.findAll();
			guilds.forEach(async guild => {
				guild.set('blacklist', {
					members: [],
					roles: []
				});
				await guild.save();
			});
		}
	}
};