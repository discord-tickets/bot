const { Button } = require('@eartharoid/dbf');

module.exports = class CreateButton extends Button {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'create',
		});
	}

	/**
	 * @param {*} id
	 * @param {import("discord.js").ButtonInteraction} interaction
	 */
	async run(id, interaction) {
		await this.client.tickets.create({
			categoryId: id.target,
			interaction,
			topic: id.topic,
		});
	}
};
