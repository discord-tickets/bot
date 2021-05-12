const EventListener = require('../modules/listeners/listener');

module.exports = class MessageUpdateEventListener extends EventListener {
	constructor(client) {
		super(client, {
			event: 'messageUpdate'
		});
	}

	async execute(oldm, newm) {
		if (newm.partial) {
			try {
				await newm.fetch();
			} catch (err) {
				return this.client.log.error(err);
			}
		}

		if (!newm.guild) return;

		let settings = await newm.guild.settings;
		if (!settings) settings = await newm.guild.createSettings();

		if (settings.log_messages && !newm.system) this.client.tickets.archives.updateMessage(newm); // update the message in the database
	}
};