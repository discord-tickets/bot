module.exports = {
	event: 'messageDelete',
	execute: async (client, message) => {
		if (!message.guild) return;

		let settings = await message.guild.settings;
		if (!settings) settings = await message.guild.createSettings();

		if (settings.log_messages && !message.system) client.tickets.archives.deleteMessage(message); // mark the message as deleted in the database (if it exists)
	}
};