const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client.menus,
			event: 'run',
		});
	}

	run({
		menu,
		interaction,
	}) {
		this.client.log.info.menus(`${interaction.user.tag} used the "${menu.id}" menu`);
		return true;
	}
};
