module.exports = {
	event: 'messageDelete',
	execute: async (client, message) => {

		let settings = await message.guild?.settings;

		if (settings?.log_messages) {
			if (message.system) return;
			client.tickets.archives.deleteMessage(message);
		}
	}
};