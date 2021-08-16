const EventListener = require('../modules/listeners/listener');

module.exports = class GuildDeleteEventListener extends EventListener {
	constructor(client) {
		super(client, { event: 'guildDelete' });
	}

	async execute(guild) {
		this.client.log.info(`Removed from "${guild.name}"`);
		await guild.deleteSettings();
	}
};