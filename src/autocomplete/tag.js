const { Autocompleter } = require('@eartharoid/dbf');

module.exports = class TagCompleter extends Autocompleter {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'tag',
		});
	}

	/**
	 * @param {string} value
	 * @param {*} command
	 * @param {import("discord.js").AutocompleteInteraction} interaction
	 */
	async run(value, command, interaction) {
		/** @type {import("client")} */
		const client = this.client;

		const tags = await client.prisma.tag.findMany({ where: { guildId: interaction.guild.id } });
		const options = value ? tags.filter(tag =>
			tag.name.match(new RegExp(value, 'i')) ||
			tag.content.match(new RegExp(value, 'i')) ||
			tag.regex?.match(new RegExp(value, 'i')),
		) : tags;
		await interaction.respond(
			options
				.slice(0, 25)
				.map(tag => ({
					name: tag.name,
					value: tag.id,
				})),
		);
	}
};