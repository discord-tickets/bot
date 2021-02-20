module.exports = {
	event: 'INTERACTION_CREATE',
	raw: true,
	execute: async (client, interaction) => {

		switch (interaction.type) {
		case 1:
			client.log.debug('Received interaction ping, responding with pong');
			await client.api.interactions(interaction.id, interaction.token).callback.post({
				data: {
					type: 1, // PONG
				}
			});
			break;
		case 2:
			client.commands.execute(interaction.data.name, interaction);
			break;
		}

	}
};