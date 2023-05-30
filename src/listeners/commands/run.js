const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client.commands,
			event: 'run',
		});
	}

	run({
		command,
		interaction,
	}) {
		const types = {
			1: 'slash',
			2: 'user',
			3: 'message',
		};
		this.client.log.info.commands(`${interaction.user.tag} used the "${command.name}" ${types[command.type]} command`);
		return true;
	}
};
