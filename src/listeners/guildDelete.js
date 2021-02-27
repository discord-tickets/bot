module.exports = {
	event: 'guildDelete',
	execute: async (client, guild) => {
		client.log.info(`Removed from ${guild.name}`);
		await guild.deleteSettings();
	}
};