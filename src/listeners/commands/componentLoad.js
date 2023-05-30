const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client.commands,
			event: 'componentLoad',
		});
	}

	run(command) {
		const types = {
			1: 'slash',
			2: 'user',
			3: 'message',
		};
		this.client.log.info.commands(`Loaded "${command.name}" ${types[command.type]} command`);
		return true;
	}
};
