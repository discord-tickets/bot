const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client,
			event: 'warn',
		});
	}

	run(warn) {
		this.client.log.warn(warn);
	}
};
