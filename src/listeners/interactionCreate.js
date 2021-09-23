const EventListener = require('../modules/listeners/listener');
const { Interaction } = require('discord.js'); // eslint-disable-line no-unused-vars

module.exports = class InteractionCreateEventListener extends EventListener {
	constructor(client) {
		super(client, { event: 'interactionCreate' });
	}

	/**
	 * @param {Interaction} interaction
	 */
	async execute(interaction) {
		this.client.log.debug(interaction);


		//
		// CHECK BLACKLIST
		//

		if (interaction.isCommand()) {
			// handle slash commands
			this.client.commands.handle(interaction);
		} else if (interaction.isButton()) {
			// handle single-category panels and confirmations etc
		} else if (interaction.isSelectMenu()) {
			// handle multi-category panels and new command
		}
	}
};