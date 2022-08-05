const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client,
			event: 'guildCreate',
		});
	}

	run(guild) {
		this.client.log.success(`Added to guild "${guild.name}"`);
	}
};
