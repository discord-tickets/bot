const dbf = require('@eartharoid/dbf');

module.exports = class extends dbf.Listener {
	constructor(client) {
		super(client, {
			emitter: client,
			event: 'ready',
			id: 'clientReady',
			once: true,
		});
	}

	run() {
		this.client.log.success('Connected to Discord as "%s"', this.client.user.tag);
	}
};