module.exports = {
	event: 'INTERACTION_CREATE',
	raw: true,
	execute: async (client, interaction) => {

		if (interaction.type === 1) {
			client.log.debug('Received interaction ping, responding with pong');
			return await client.api.interactions(interaction.id, interaction.token).callback.post({
				data: {
					type: 1,
				}
			});
		}

		const cmd = interaction.data.name;

		if (!client.commands.commands.has(cmd))
			return client.log.warn(`[COMMANDS] Received "${cmd}" command invocation, but the command manager does not have a "${cmd}" command`);

		try {
			client.commands.execute(cmd, interaction);
		} catch (e) {
			client.log.warn(`[COMMANDS] An error occurred whilst executed the ${cmd} command`);
			client.log.error(e);
		}

	}
};