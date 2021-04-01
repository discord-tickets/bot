module.exports = {
	event: 'message',
	execute: async (client, message) => {

		let settings = await message.guild?.settings;

		if (settings?.log_messages) {
			if (message.system) return;
			client.tickets.archives.addMessage(message);
		}

		client.commands.handle(message);
	}
};