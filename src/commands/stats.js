const Command = require('../modules/commands/command');
const Keyv = require('keyv');
const {
	Message, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

module.exports = class StatsCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			aliases: [],
			args: [],
			description: i18n('commands.stats.description'),
			internal: true,
			name: i18n('commands.stats.name'),
			process_args: false,
			staff_only: true
		});

		this.cache = new Keyv({ namespace: 'cache.commands.stats' });
	}

	/**
	 * @param {Message} message
	 * @param {string} args
	 * @returns {Promise<void|any>}
	 */
	async execute(message) {
		const settings = await this.client.utils.getSettings(message.guild);
		const i18n = this.client.i18n.getLocale(settings.locale);

		const messages = await this.client.db.models.Message.findAndCountAll();

		let stats = await this.cache.get(message.guild.id);

		if (!stats) {
			const tickets = await this.client.db.models.Ticket.findAndCountAll({ where: { guild: message.guild.id } });
			stats = { // maths
				messages: settings.log_messages
					? await messages.rows
						.reduce(async (acc, row) => (await this.client.db.models.Ticket.findOne({ where: { id: row.ticket } }))
							.guild === message.guild.id
							? await acc + 1
							: await acc, 0)
					: null,
				response_time: Math.floor(tickets.rows.reduce((acc, row) => row.first_response
					? acc + ((Math.abs(new Date(row.createdAt) - new Date(row.first_response)) / 1000) / 60)
					: acc, 0) / tickets.count),
				tickets: tickets.count
			};
			await this.cache.set(message.guild.id, stats, 60 * 60 * 1000); // cache for an hour
		}

		const guild_embed = new MessageEmbed()
			.setColor(settings.colour)
			.setTitle(i18n('commands.stats.response.guild.title'))
			.setDescription(i18n('commands.stats.response.guild.description'))
			.addField(i18n('commands.stats.fields.tickets'), stats.tickets, true)
			.addField(i18n('commands.stats.fields.response_time.title'), i18n('commands.stats.fields.response_time.minutes', stats.response_time), true)
			.setFooter(settings.footer, message.guild.iconURL());

		if (stats.messages) guild_embed.addField(i18n('commands.stats.fields.messages'), stats.messages, true);

		await message.channel.send({embeds: [guild_embed]});

		if (this.client.guilds.cache.size > 1) {
			await message.channel.send({
				embeds: [new MessageEmbed()
					.setColor(settings.colour)
					.setTitle(i18n('commands.stats.response.global.title'))
					.setDescription(i18n('commands.stats.response.global.description'))
					.addField(i18n('commands.stats.fields.tickets'), stats.tickets, true)
					.addField(i18n('commands.stats.fields.response_time.title'), i18n('commands.stats.fields.response_time.minutes', stats.response_time), true)
					.addField(i18n('commands.stats.fields.messages'), stats.messages, true)
					.setFooter(settings.footer, message.guild.iconURL())]
			});
		}
	}
};
