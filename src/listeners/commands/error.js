const { Listener } = require('@eartharoid/dbf');
const { handleInteractionError } = require('../../lib/error');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client.commands,
			event: 'error',
		});
	}

	async run(...params) {
		return handleInteractionError(...params);
	}
};
