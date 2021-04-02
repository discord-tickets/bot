module.exports = {
	event: 'message',
	execute: async (client, message) => {

		let settings = await message.guild?.settings;

		if (settings?.log_messages && !message.system)
			client.tickets.archives.addMessage(message);

		client.commands.handle(message);
	}
};