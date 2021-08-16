const EventListener = require('../modules/listeners/listener');

module.exports = class MessageUpdateEventListener extends EventListener {
	constructor(client) {
		super(client, { event: 'messageUpdate' });
	}

	async execute(oldm, newm) {
		if (newm.partial) {
			try {
				await newm.fetch();
			} catch (error) {
				return this.client.log.error(error);
			}
		}

		if (!newm.guild) return;

		const settings = await this.client.utils.getSettings(newm.guild);

		if (settings.log_messages && !newm.system) this.client.tickets.archives.updateMessage(newm); // update the message in the database
	}
};