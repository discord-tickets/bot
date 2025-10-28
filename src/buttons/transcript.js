const { Button } = require('@eartharoid/dbf');

module.exports = class ClaimButton extends Button {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'transcript',
		});
	}

	/**
	 * @param {*} id
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 */
	async run(id, interaction) {
		/** @type {import("client")} */
		const client = this.client;

		const cmd = client.commands.commands.slash.get('transcript');
		return await cmd.run(interaction, id.ticket);
	}
};
