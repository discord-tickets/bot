const EventListener = require('../modules/listeners/listener');

module.exports = class MessageDeleteEventListener extends EventListener {
	constructor(client) {
		super(client, {
			event: 'messageDelete'
		});
	}

	async execute(message) {
		if (!message.guild) return;

		let settings = await message.guild.settings;
		if (!settings) settings = await message.guild.createSettings();

		if (settings.log_messages && !message.system) this.client.tickets.archives.deleteMessage(message); // mark the message as deleted in the database (if it exists)
	}
};