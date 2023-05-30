const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client.autocomplete,
			event: 'run',
		});
	}

	run({
		completer,
		interaction,
	}) {
		this.client.log.verbose.autocomplete(`${interaction.user.tag} used the "${completer.id}" autocompleter`);
		return true;
	}
};
