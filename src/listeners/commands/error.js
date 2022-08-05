const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client.commands,
			event: 'error',
		});
	}

	run({
		command,
		error,
	}) {
		this.client.log.error.commands(`"${command.name}" command execution error:`, error);
		return true;
	}
};
