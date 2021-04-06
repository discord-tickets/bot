module.exports = {
	event: 'guildCreate',
	execute: async (client, guild) => {
		client.log.info(`Added to "${guild.name}"`);
		await guild.createSettings();
	}
};