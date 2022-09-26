const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client.buttons,
			event: 'run',
		});
	}

	run({
		button,
		interaction,
	}) {
		this.client.log.info.buttons(`${interaction.user.tag} used the "${button.id}" button`);
		return true;
	}
};
