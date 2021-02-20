module.exports = {
	event: 'guildDelete',
	execute: async (client, guild) => {
		client.log.console(`Removed from ${guild.name}`);
		await guild.deleteSettings();
	}
};