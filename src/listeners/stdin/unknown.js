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
		console.log('Unknown command:', commandName);
	}
};
