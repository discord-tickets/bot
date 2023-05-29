const { Autocompleter } = require('@eartharoid/dbf');

module.exports = class CategoryCompleter extends Autocompleter {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'category',
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

		let categories = await client.prisma.category.findMany({ where: { guildId: interaction.guild.id } });

		if (command.name === 'move') {
			const ticket = await client.prisma.ticket.findUnique({ where: { id: interaction.channel.id } });
			if (ticket) categories = categories.filter(category => ticket.categoryId !== category.id);
		}

		const options = value ? categories.filter(category => category.name.match(new RegExp(value, 'i'))) : categories;
		await interaction.respond(
			options
				.slice(0, 25)
				.map(category => ({
					name: category.name,
					value: category.id,
				})),
		);
	}
};
