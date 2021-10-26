const Command = require('../modules/commands/command');
const Keyv = require('keyv');
const {
	Interaction, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

module.exports = class StatsCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			description: i18n('commands.stats.description'),
			internal: true,
			name: i18n('commands.stats.name'),
			staff_only: true
		});

		this.cache = new Keyv({ namespace: 'cache.commands.stats' });
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await this.client.utils.getSettings(interaction.guild.id);
		const i18n = this.client.i18n.getLocale(settings.locale);

		const messages = await this.client.db.models.Message.findAndCountAll();

		let stats = await this.cache.get(interaction.guild.id);

		if (!stats) {
			const tickets = await this.client.db.models.Ticket.findAndCountAll({ where: { guild: interaction.guild.id } });
			stats = { // maths
				messages: settings.log_messages
					? await messages.rows
						.reduce(async (acc, row) => (await this.client.db.models.Ticket.findOne({ where: { id: row.ticket } }))
							.guild === interaction.guild.id
							? await acc + 1
							: await acc, 0)
					: null,
				response_time: Math.floor(tickets.rows.reduce((acc, row) => row.first_response
					? acc + ((Math.abs(new Date(row.createdAt) - new Date(row.first_response)) / 1000) / 60)
					: acc, 0) / tickets.count),
				tickets: tickets.count
			};
			await this.cache.set(interaction.guild.id, stats, 60 * 60 * 1000); // cache for an hour
		}

		const guild_embed = new MessageEmbed()
			.setColor(settings.colour)
			.setTitle(i18n('commands.stats.response.guild.title'))
			.setDescription(i18n('commands.stats.response.guild.description'))
			.addField(i18n('commands.stats.fields.tickets'), String(stats.tickets), true)
			.addField(i18n('commands.stats.fields.response_time.title'), i18n('commands.stats.fields.response_time.minutes', stats.response_time), true)
			.setFooter(settings.footer, interaction.guild.iconURL());

		if (stats.messages) guild_embed.addField(i18n('commands.stats.fields.messages'), String(stats.messages), true);

		const embeds = [guild_embed];

		if (this.client.guilds.cache.size > 1) {
			let global = await this.cache.get('global');

			if (!global) {
				const tickets = await this.client.db.models.Ticket.findAndCountAll();
				global = { // maths
					messages: settings.log_messages
						? await messages.count
						: null,
					response_time: Math.floor(tickets.rows.reduce((acc, row) => row.first_response
						? acc + ((Math.abs(new Date(row.createdAt) - new Date(row.first_response)) / 1000) / 60)
						: acc, 0) / tickets.count),
					tickets: tickets.count
				};
				await this.cache.set('global', global, 60 * 60 * 1000); // cache for an hour
			}

			const global_embed = new MessageEmbed()
				.setColor(settings.colour)
				.setTitle(i18n('commands.stats.response.global.title'))
				.setDescription(i18n('commands.stats.response.global.description'))
				.addField(i18n('commands.stats.fields.tickets'), String(global.tickets), true)
				.addField(i18n('commands.stats.fields.response_time.title'), i18n('commands.stats.fields.response_time.minutes', global.response_time), true)
				.setFooter(settings.footer, interaction.guild.iconURL());

			if (stats.messages) global_embed.addField(i18n('commands.stats.fields.messages'), String(global.messages), true);

			embeds.push(global_embed);
		}

		await interaction.editReply({ embeds });
	}
};
