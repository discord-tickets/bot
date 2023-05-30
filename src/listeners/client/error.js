const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client,
			event: 'error',
		});
	}

	run(error) {
		this.client.log.error(error);
	}
};
