const { StdinCommand } = require('@eartharoid/dbf');
const sync = require('../lib/sync');

module.exports = class extends StdinCommand {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'sync',
		});
	}

	async run() {
		await sync(this.client);
	}
};