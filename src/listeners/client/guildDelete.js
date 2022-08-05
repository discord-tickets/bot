const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client,
			event: 'guildDelete',
		});
	}

	run(guild) {
		this.client.log.info(`Removed from guild "${guild.name}"`);
	}
};
