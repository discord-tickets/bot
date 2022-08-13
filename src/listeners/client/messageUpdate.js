const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client,
			event: 'messageUpdate',
		});
	}

	run(oldMessage, newMessage) {
		// TODO: archive messages in tickets
		// TODO: log channel
	}
};
