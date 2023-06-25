const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client.autocomplete,
			event: 'error',
		});
	}

	async run({
		completer,
		error,
		interaction,
	}) {
		this.client.log.error.autocomplete(`"${completer.id}" autocomplete execution error:`, {
			error,
			interaction,
		});
	}
};
