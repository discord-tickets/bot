const { Autocompleter } = require('@eartharoid/dbf');
const emoji = require('node-emoji');
const Cryptr = require('cryptr');
const { decrypt } = new Cryptr(process.env.ENCRYPTION_KEY);

module.exports = class ReferencesCompleter extends Autocompleter {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'references',
		});
	}

	format(ticket) {
		const date = new Date(ticket.createdAt).toLocaleString(ticket.guild.locale, { dateStyle: 'short' });
		const topic = ticket.topic ? '| ' + decrypt(ticket.topic).substring(0, 50) : '';
		const category = emoji.hasEmoji(ticket.category.emoji) ? emoji.get(ticket.category.emoji) + ' ' + ticket.category.name : ticket.category.name;
		return `${category} #${ticket.number} - ${date} ${topic}`;
	}

	/**
	 * @param {string} value
	 * @param {*} comamnd
	 * @param {import("discord.js").AutocompleteInteraction} interaction
	 */
	async run(value, comamnd, interaction) {
		/** @type {import("client")} */
		const client = this.client;
		const tickets = await client.prisma.ticket.findMany({
			include: {
				category: {
					select: {
						emoji: true,
						name: true,
					},
				},
				guild: true,
			},
			where: {
				createdById: interaction.user.id,
				guildId: interaction.guild.id,
				open: false,
			},
		});
		const options = value ? tickets.filter(t => this.format(t).match(new RegExp(value, 'i'))) : tickets;
		await interaction.respond(
			options
				.slice(0, 25)
				.map(t => ({
					name: this.format(t),
					value: t.id,
				})),
		);
	}
};