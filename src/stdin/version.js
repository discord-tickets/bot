const { StdinCommand } = require('@eartharoid/dbf');
const { version } = require('../../package.json');
const checkForUpdates = require('../lib/updates');

module.exports = class extends StdinCommand {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'version',
		});
	}

	async run() {
		this.client.log.info('Current version:', version);
		checkForUpdates(this.client);
	}
};
