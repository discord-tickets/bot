const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client.menus,
			event: 'componentLoad',
		});
	}

	run(menu) {
		this.client.log.info.menus(`Loaded "${menu.id}" menu`);
		return true;
	}
};
