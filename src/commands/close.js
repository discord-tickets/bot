const Command = require('../modules/commands/command');
// eslint-disable-next-line no-unused-vars
const {
	Message, // eslint-disable-line no-unused-vars
	MessageEmbed,
	MessageMentions
} = require('discord.js');
const { Op } = require('sequelize');
const toTime = require('to-time-monthsfork');

module.exports = class CloseCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			// options: [
			// 	{
			// 		alias: i18n('commands.close.options.ticket.alias'),
			// 		description: i18n('commands.close.options.ticket.description'),
			// 		example: i18n('commands.close.options.ticket.example'),
			// 		name: i18n('commands.close.options.ticket.name'),
			// 		required: false,
			// 		type: String
			// 	},
			// 	{
			// 		alias: i18n('commands.close.options.reason.alias'),
			// 		description: i18n('commands.close.options.reason.description'),
			// 		example: i18n('commands.close.options.reason.example'),
			// 		name: i18n('commands.close.options.reason.name'),
			// 		required: false,
			// 		type: String
			// 	},
			// 	{
			// 		alias: i18n('commands.close.options.time.alias'),
			// 		description: i18n('commands.close.options.time.description'),
			// 		example: i18n('commands.close.options.time.example'),
			// 		name: i18n('commands.close.options.time.name'),
			// 		required: false,
			// 		type: String
			// 	}
			// ],
			description: i18n('commands.close.description'),
			internal: true,
			name: i18n('commands.close.name')
		});
	}

	/**
	 * @param {Message} message
	 * @param {*} options
	 * @returns {Promise<void|any>}
	 */
	async execute(message, options) {
		const arg_ticket = this.options[0].name;
		const arg_reason = this.options[1].name;
		const arg_time = this.options[2].name;

		const settings = await this.client.utils.getSettings(message.guild);
		const i18n = this.client.i18n.getLocale(settings.locale);

		if (options[arg_time]) {
			let period;

			try {
				period = toTime(options[arg_time]).ms();
			} catch {
				return await message.channel.send({
					embeds: [
						new MessageEmbed()
							.setColor(settings.error_colour)
							.setTitle(i18n('commands.close.response.invalid_time.title'))
							.setDescription(i18n('commands.close.response.invalid_time.description'))
							.setFooter(settings.footer, message.guild.iconURL())
					]
				});
			}

			const tickets = await this.client.db.models.Ticket.findAndCountAll({
				where: {
					guild: message.guild.id,
					last_message: { [Op.lte]: new Date(Date.now() - period) }
				}
			});

			if (tickets.count === 0) {
				return await message.channel.send({
					embeds: [
						new MessageEmbed()
							.setColor(settings.error_colour)
							.setTitle(i18n('commands.close.response.no_tickets.title'))
							.setDescription(i18n('commands.close.response.no_tickets.description'))
							.setFooter(settings.footer, message.guild.iconURL())
					]
				});
			} else {
				const collector_message = await message.channel.send({
					embeds: [
						new MessageEmbed()
							.setColor(settings.colour)
							.setTitle(i18n('commands.close.response.confirm_multiple.title'))
							.setDescription(i18n('commands.close.response.confirm_multiple.description', tickets.count, tickets.count))
							.setFooter(settings.footer, message.guild.iconURL())
					]
				});

				await collector_message.react('✅');

				const filter = (reaction, user) => user.id === message.author.id && reaction.emoji.name === '✅';
				const collector = collector_message.createReactionCollector({
					filter,
					time: 30000
				});

				collector.on('collect', async () => {
					await collector_message.reactions.removeAll();

					await message.channel.send({
						embeds: [
							new MessageEmbed()
								.setColor(settings.success_colour)
								.setTitle(i18n('commands.close.response.closed_multiple.title', tickets.count, tickets.count))
								.setDescription(i18n('commands.close.response.closed_multiple.description', tickets.count, tickets.count))
								.setFooter(settings.footer, message.guild.iconURL())
						]
					});

					for (const ticket of tickets.rows) {
						await this.client.tickets.close(ticket.id, message.author.id, message.guild.id, options[arg_reason]);
					}

				});

				collector.on('end', async collected => {
					if (collected.size === 0) {
						await collector_message.reactions.removeAll();
						await collector_message.edit({
							embeds: [
								new MessageEmbed()
									.setColor(settings.error_colour)
									.setAuthor(message.author.username, message.author.displayAvatarURL())
									.setTitle(i18n('commands.close.response.confirmation_timeout.title'))
									.setDescription(i18n('commands.close.response.confirmation_timeout.description'))
									.setFooter(this.client.utils.footer(settings.footer, i18n('message_will_be_deleted_in', 15)), message.guild.iconURL())
							]
						});
						setTimeout(async () => {
							await collector_message
								.delete()
								.catch(() => this.client.log.warn('Failed to delete response (collector) message'));
							await message
								.delete()
								.catch(() => this.client.log.warn('Failed to delete original message'));
						}, 15000);
					}
				});
			}

		} else {
			let t_row;
			if (options[arg_ticket]) {
				options[arg_ticket] = options[arg_ticket].replace(MessageMentions.CHANNELS_PATTERN, '$1');
				t_row = await this.client.tickets.resolve(options[arg_ticket], message.guild.id);

				if (!t_row) {
					return await message.channel.send({
						embeds: [
							new MessageEmbed()
								.setColor(settings.error_colour)
								.setTitle(i18n('commands.close.response.unresolvable.title'))
								.setDescription(i18n('commands.close.response.unresolvable.description', options[arg_ticket]))
								.setFooter(settings.footer, message.guild.iconURL())
						]
					});
				}
			} else {
				t_row = await this.client.db.models.Ticket.findOne({ where: { id: message.channel.id } });

				if (!t_row) {
					return await message.channel.send({
						embeds: [
							new MessageEmbed()
								.setColor(settings.error_colour)
								.setTitle(i18n('commands.close.response.not_a_ticket.title'))
								.setDescription(i18n('commands.close.response.not_a_ticket.description'))
								.setFooter(settings.footer, message.guild.iconURL())
						]
					});
				}
			}

			const collector_message = await message.channel.send({
				embeds: [
					new MessageEmbed()
						.setColor(settings.colour)
						.setTitle(i18n('commands.close.response.confirm.title'))
						.setDescription(i18n('commands.close.response.confirm.description', t_row.number))
						.setFooter(settings.footer, message.guild.iconURL())
				]
			});

			await collector_message.react('✅');

			const filter = (reaction, user) => user.id === message.author.id && reaction.emoji.name === '✅';
			const collector = collector_message.createReactionCollector({
				filter,
				time: 30000
			});

			collector.on('collect', async () => {
				collector.stop();

				if (message.channel.id === t_row.id) {
					await collector_message.delete();
				} else {
					await collector_message.reactions.removeAll();
					await collector_message.edit({
						embeds: [
							new MessageEmbed()
								.setColor(settings.success_colour)
								.setTitle(i18n('commands.close.response.closed.title'))
								.setDescription(i18n('commands.close.response.closed.description', t_row.number))
								.setFooter(settings.footer, message.guild.iconURL())
						]
					});
				}

				await this.client.tickets.close(t_row.id, message.author.id, message.guild.id, options[arg_reason]);
			});

			collector.on('end', async collected => {
				if (collected.size === 0) {
					await collector_message.reactions.removeAll();
					await collector_message.edit({
						embeds: [
							new MessageEmbed()
								.setColor(settings.error_colour)
								.setAuthor(message.author.username, message.author.displayAvatarURL())
								.setTitle(i18n('commands.close.response.confirmation_timeout.title'))
								.setDescription(i18n('commands.close.response.confirmation_timeout.description'))
								.setFooter(this.client.utils.footer(settings.footer, i18n('message_will_be_deleted_in', 15)), message.guild.iconURL())
						]
					});
					setTimeout(async () => {
						await collector_message
							.delete()
							.catch(() => this.client.log.warn('Failed to delete response (collector) message'));
						await message
							.delete()
							.catch(() => this.client.log.warn('Failed to delete original message'));
					}, 15000);
				}
			});

		}
	}
};
