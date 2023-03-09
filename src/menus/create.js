const { Menu } = require('@eartharoid/dbf');
const { MessageFlags } = require('discord.js');

module.exports = class CreateMenu extends Menu {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'create',
		});
	}

	/**
	 * @param {*} id
	 * @param {import("discord.js").SelectMenuInteraction} interaction
	 */
	async run(id, interaction) {
		if (!interaction.message.flags.has(MessageFlags.Ephemeral)) interaction.message.edit({ components: interaction.message.components }).catch(() => { }); // reset the select menu (to fix a UI issue)
		await this.client.tickets.create({
			...id,
			categoryId: interaction.values[0],
			interaction,
		});
	}
};