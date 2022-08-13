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
		/** @type {import("client")} */
		const client = this.client;
		const settings = await client.prisma.guild.findUnique({ where: { id: interaction.guild.id } });
		const tickets = await client.prisma.ticket.findMany({
			where: {
				createdById: interaction.user.id,
				guildId: interaction.guild.id,
				open: false,
			},
		});
		const options = value ? tickets.filter(t =>
			String(t.number).match(new RegExp(value, 'i')) ||
			t.topic?.match(new RegExp(value, 'i')) ||
			new Date(t.createdAt).toLocaleString(settings.locale, { dateStyle: 'short' })?.match(new RegExp(value, 'i')),
		) : tickets;
		await interaction.respond(
			options
				.slice(0, 25)
				.map(t => {
					const date = new Date(t.createdAt).toLocaleString(settings.locale, { dateStyle: 'short' });
					return {
						name: `#${t.number} - ${date} ${t.topic ? '| ' + t.topic.substring(0, 50) : ''}`,
						value: t.id,
					};
				}),
		);
	}
};