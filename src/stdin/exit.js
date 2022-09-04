const { StdinCommand } = require('@eartharoid/dbf');

module.exports = class extends StdinCommand {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'exit',
		});
	}

	async run() {
		this.client.log.info('Exiting');
		process.exit();
	}
};