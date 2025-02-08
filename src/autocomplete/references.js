const { Autocompleter } = require('@eartharoid/dbf');

module.exports = class ReferencesCompleter extends Autocompleter {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'references',
		});
	}


	/**
	 * @param {string} value
	 * @param {*} comamnd
	 * @param {import("discord.js").AutocompleteInteraction} interaction
	 */
	async run(value, comamnd, interaction) {
		await interaction.respond(
			await this.client.autocomplete.components.get('ticket').getOptions(value, {
				guildId: interaction.guild.id,
				open: false,
				userId: interaction.user.id,
			}),
		);
	}
};
