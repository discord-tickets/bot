const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client.buttons,
			event: 'componentLoad',
		});
	}

	run(button) {
		this.client.log.info.buttons(`Loaded "${button.id}" button`);
		return true;
	}
};
