module.exports = {
	event: 'message',
	execute: async (client, message) => {
		if (!message.guild) return;

		let settings = await message.guild.settings;
		if (!settings) settings = await message.guild.createSettings();

		if (settings.log_messages && !message.system) client.tickets.archives.addMessage(message); // add the message to the archives (if it is in a ticket channel)

		client.commands.handle(message); // pass the message to the command handler
	}
};