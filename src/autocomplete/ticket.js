/* eslint-disable no-underscore-dangle */
const { Autocompleter } = require('@eartharoid/dbf');
const emoji = require('node-emoji');
const Cryptr = require('cryptr');
const { decrypt } = new Cryptr(process.env.ENCRYPTION_KEY);
const Keyv = require('keyv');
const ms = require('ms');
const { isStaff } = require('../lib/users');

module.exports = class TicketCompleter extends Autocompleter {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'ticket',
		});

		this.cache = new Keyv();
	}

	async getOptions(value, {
		guildId,
		open,
		userId,
	}) {
		/** @type {import("client")} */
		const client = this.client;
		const cacheKey = [guildId, userId, open].join('/');

		let tickets = await this.cache.get(cacheKey);

		if (!tickets) {
			const { locale } = await client.prisma.guild.findUnique({
				select: { locale: true },
				where: { id: guildId },
			});
			tickets = await client.prisma.ticket.findMany({
				include: {
					category: {
						select: {
							emoji: true,
							name: true,
						},
					},
				},
				where: {
					createdById: userId,
					guildId,
					open,
				},
			});
			tickets = tickets.map(ticket => {
				const date = new Date(ticket.createdAt).toLocaleString([locale, 'en-GB'], { dateStyle: 'short' });
				const topic = ticket.topic ? '- ' + decrypt(ticket.topic).replace(/\n/g, ' ').substring(0, 50) : '';
				const category = emoji.hasEmoji(ticket.category.emoji) ? emoji.get(ticket.category.emoji) + ' ' + ticket.category.name : ticket.category.name;
				ticket._name = `${category} #${ticket.number} (${date}) ${topic}`;
				return ticket;
			});
			this.cache.set(cacheKey, tickets, ms('1m'));
		}

		const options = value ? tickets.filter(t => t._name.match(new RegExp(value, 'i'))) : tickets;
		return options
			.slice(0, 25)
			.map(t => ({
				name: t._name,
				value: t.id,
			}));
	}

	/**
	 * @param {string} value
	 * @param {*} command
	 * @param {import("discord.js").AutocompleteInteraction} interaction
	 */
	async run(value, command, interaction) {
		const otherMember = await isStaff(interaction.guild, interaction.user.id) && interaction.options.data[1]?.value;
		const userId = otherMember || interaction.user.id;
		await interaction.respond(
			await this.getOptions(value, {
				guildId: interaction.guild.id,
				open: ['add', 'close', 'force-close', 'remove'].includes(command.name),  // false for `new`, `transcript` etc
				userId,
			}),
		);
	}
};
