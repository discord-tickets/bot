const { StdinCommand } = require('@eartharoid/dbf');

module.exports = class extends StdinCommand {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'settings',
		});
	}

	async run() {
		this.client.log.info.settings(process.env.HTTP_EXTERNAL + '/settings');
	}
};