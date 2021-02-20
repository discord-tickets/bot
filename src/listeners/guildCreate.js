module.exports = {
	event: 'guildCreate',
	execute: async (client, guild) => {
		client.log.console(`Added to ${guild.name}`);
		await guild.createSettings();
	}
};