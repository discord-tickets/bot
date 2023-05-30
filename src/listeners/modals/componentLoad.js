const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client.modals,
			event: 'componentLoad',
		});
	}

	run(modal) {
		this.client.log.info.modals(`Loaded "${modal.id}" modal`);
		return true;
	}
};
