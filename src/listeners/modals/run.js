const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client.modals,
			event: 'run',
		});
	}

	run({
		modal,
		interaction,
	}) {
		this.client.log.info.modals(`${interaction.user.tag} used the "${modal.id}" modal`);
		return true;
	}
};
