const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client.stdin,
			event: 'unknown',
		});
	}

	run(commandName) {
		this.client.log.warn(`Unknown command: "${commandName}"; type "help" for a list of commands`);
	}
};
