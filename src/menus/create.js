const { Menu } = require('@eartharoid/dbf');

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
		interaction.message.edit({ components: interaction.message.components }); // reset the select menu (minor client-side UI issue)
		await this.client.tickets.create({
			categoryId: interaction.values[0],
			interaction,
			topic: id.topic,
		});
	}
};