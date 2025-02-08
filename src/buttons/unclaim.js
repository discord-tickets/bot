const { Button } = require('@eartharoid/dbf');

module.exports = class UnclaimButton extends Button {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'unclaim',
		});
	}

	/**
	 * @param {*} id
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 */
	async run(id, interaction) {
		/** @type {import("client")} */
		const client = this.client;

		await interaction.deferReply({ ephemeral: true });
		await client.tickets.release(interaction);
	}
};
