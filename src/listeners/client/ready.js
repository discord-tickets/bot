const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client,
			event: 'ready',
			once: true,
		});
	}

	run() {
		// process.title = `"[Discord Tickets] ${this.client.user.tag}"`; // too long and gets cut off
		process.title = 'tickets';
		this.client.log.success('Connected to Discord as "%s"', this.client.user.tag);
	}
};
