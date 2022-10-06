const { StdinCommand } = require('@eartharoid/dbf');
const { homepage } = require('../../package.json');

module.exports = class extends StdinCommand {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'help',
		});
	}

	async run() {
		this.client.log.info('Documentation:', homepage);
		this.client.log.info('Support: https://lnk.earth/discord');
		this.client.log.info('stdin commands:\n' + this.client.stdin.components.map(c => `> ${c.id}`).join('\n'));
	}
};