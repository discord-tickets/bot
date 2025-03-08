const { Autocompleter } = require('@eartharoid/dbf');
const ms = require('ms');

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
		const cacheKey = `cache/guild-tags:${interaction.guild.id}`;
		let tags = await client.keyv.get(cacheKey);
		if (!tags) {
			tags = await client.prisma.tag.findMany({
				select: {
					content: true,
					id: true,
					name: true,
					regex: true,
					imageUrl: true, // Add imageUrl to the selection
				},
				where: { guildId: interaction.guild.id },
			});
			client.keyv.set(cacheKey, tags, ms('1h'));
		}
		
		const options = value ? tags.filter(tag =>
			tag.name.match(new RegExp(value, 'i')) ||
			tag.content.match(new RegExp(value, 'i')) ||
			tag.regex?.match(new RegExp(value, 'i')),
		) : tags;
		
		await interaction.respond(
			options
				.slice(0, 25)
				.map(tag => ({
					name: tag.imageUrl ? `${tag.name} 🖼️` : tag.name, // Add image icon if tag has an image
					value: tag.id,
				})),
		);
	}
};