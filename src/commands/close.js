const Command = require('../modules/commands/command');
const {
	Interaction, // eslint-disable-line no-unused-vars
	MessageActionRow,
	MessageButton,
	MessageEmbed
} = require('discord.js');
const { Op } = require('sequelize');
const ms = require('ms');

module.exports = class CloseCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			description: i18n('commands.close.description'),
			internal: true,
			name: i18n('commands.close.name'),
			options: [
				{
					description: i18n('commands.close.options.reason.description'),
					name: i18n('commands.close.options.reason.name'),
					required: false,
					type: Command.option_types.STRING
				},
				{
					description: i18n('commands.close.options.ticket.description'),
					name: i18n('commands.close.options.ticket.name'),
					required: false,
					type: Command.option_types.INTEGER
				},
				{
					description: i18n('commands.close.options.time.description'),
					name: i18n('commands.close.options.time.name'),
					required: false,
					type: Command.option_types.STRING
				}
			]
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await this.client.utils.getSettings(interaction.guild.id);
		const default_i18n = this.client.i18n.getLocale(this.client.config.defaults.locale);  // command properties could be in a different locale
		const i18n = this.client.i18n.getLocale(settings.locale);

		const reason = interaction.options.getString(default_i18n('commands.close.options.reason.name'));
		const ticket = interaction.options.getInteger(default_i18n('commands.close.options.ticket.name'));
		const time = interaction.options.getString(default_i18n('commands.close.options.time.name'));

		if (time) {
			if (!await this.client.utils.isStaff(interaction.member)) {
				return await interaction.reply({
					embeds: [
						new MessageEmbed()
							.setColor(settings.error_colour)
							.setTitle(i18n('commands.close.response.no_permission.title'))
							.setDescription(i18n('commands.close.response.no_permission.description'))
							.setFooter(settings.footer, interaction.guild.iconURL())
					],
					ephemeral: true
				});
			}

			let period;
			try {
				period = ms(time);
			} catch {
				return await interaction.reply({
					embeds: [
						new MessageEmbed()
							.setColor(settings.error_colour)
							.setTitle(i18n('commands.close.response.invalid_time.title'))
							.setDescription(i18n('commands.close.response.invalid_time.description'))
							.setFooter(settings.footer, interaction.guild.iconURL())
					],
					ephemeral: true
				});
			}
			const tickets = await this.client.db.models.Ticket.findAndCountAll({
				where: {
					guild: interaction.guild.id,
					last_message: { [Op.lte]: new Date(Date.now() - period) },
					open: true
				}
			});

			if (tickets.count === 0) {
				return await interaction.reply({
					embeds: [
						new MessageEmbed()
							.setColor(settings.error_colour)
							.setTitle(i18n('commands.close.response.no_tickets.title'))
							.setDescription(i18n('commands.close.response.no_tickets.description'))
							.setFooter(settings.footer, interaction.guild.iconURL())
					],
					ephemeral: true
				});
			} else {
				await interaction.reply({
					components: [
						new MessageActionRow()
							.addComponents(
								new MessageButton()
									.setCustomId(`confirm_close_multiple:${interaction.id}`)
									.setLabel(i18n('commands.close.response.confirm_multiple.buttons.confirm', tickets.count, tickets.count))
									.setEmoji('✅')
									.setStyle('SUCCESS')
							)
							.addComponents(
								new MessageButton()
									.setCustomId(`cancel_close_multiple:${interaction.id}`)
									.setLabel(i18n('commands.close.response.confirm_multiple.buttons.cancel'))
									.setEmoji('❌')
									.setStyle('SECONDARY')
							)
					],
					embeds: [
						new MessageEmbed()
							.setColor(settings.colour)
							.setTitle(i18n('commands.close.response.confirm_multiple.title'))
							.setDescription(i18n('commands.close.response.confirm_multiple.description', tickets.count, tickets.count))
							.setFooter(this.client.utils.footer(settings.footer, i18n('collector_expires_in', 30)), interaction.guild.iconURL())
					],
					ephemeral: true
				});


				const filter = i => i.user.id === interaction.user.id && i.customId.includes(interaction.id);
				const collector = interaction.channel.createMessageComponentCollector({
					filter,
					time: 30000
				});

				collector.on('collect', async i => {
					await i.deferUpdate();

					if (i.customId === `confirm_close_multiple:${interaction.id}`) {
						for (const ticket of tickets.rows) {
							await this.client.tickets.close(ticket.id, interaction.user.id, interaction.guild.id, reason);
						}

						await i.editReply({
							components: [],
							embeds: [
								new MessageEmbed()
									.setColor(settings.success_colour)
									.setTitle(i18n('commands.close.response.closed_multiple.title', tickets.count, tickets.count))
									.setDescription(i18n('commands.close.response.closed_multiple.description', tickets.count, tickets.count))
									.setFooter(settings.footer, interaction.guild.iconURL())
							],
							ephemeral: true
						});
					} else {
						await i.editReply({
							components: [],
							embeds: [
								new MessageEmbed()
									.setColor(settings.error_colour)
									.setTitle(i18n('commands.close.response.canceled.title'))
									.setDescription(i18n('commands.close.response.canceled.description'))
									.setFooter(settings.footer, interaction.guild.iconURL())
							],
							ephemeral: true
						});
					}

					collector.stop();
				});

				collector.on('end', async collected => {
					if (collected.size === 0) {
						await interaction.editReply({
							components: [],
							embeds: [
								new MessageEmbed()
									.setColor(settings.error_colour)
									.setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
									.setTitle(i18n('commands.close.response.confirmation_timeout.title'))
									.setDescription(i18n('commands.close.response.confirmation_timeout.description'))
									.setFooter(settings.footer, interaction.guild.iconURL())
							],
							ephemeral: true
						});
					}
				});
			}
		} else {
			let t_row;
			if (ticket) {
				t_row = await this.client.tickets.resolve(ticket, interaction.guild.id);
				if (!t_row) {
					return await interaction.reply({
						embeds: [
							new MessageEmbed()
								.setColor(settings.error_colour)
								.setTitle(i18n('commands.close.response.unresolvable.title'))
								.setDescription(i18n('commands.close.response.unresolvable.description', ticket))
								.setFooter(settings.footer, interaction.guild.iconURL())
						],
						ephemeral: true
					});
				}
			} else {
				t_row = await this.client.db.models.Ticket.findOne({ where: { id: interaction.channel.id } });
				if (!t_row) {
					return await interaction.reply({
						embeds: [
							new MessageEmbed()
								.setColor(settings.error_colour)
								.setTitle(i18n('commands.close.response.not_a_ticket.title'))
								.setDescription(i18n('commands.close.response.not_a_ticket.description'))
								.setFooter(settings.footer, interaction.guild.iconURL())
						],
						ephemeral: true
					});
				}
			}

			if (t_row.creator !== interaction.member.id && !await this.client.utils.isStaff(interaction.member)) {
				return await interaction.reply({
					embeds: [
						new MessageEmbed()
							.setColor(settings.error_colour)
							.setTitle(i18n('commands.close.response.no_permission.title'))
							.setDescription(i18n('commands.close.response.no_permission.description'))
							.setFooter(settings.footer, interaction.guild.iconURL())
					],
					ephemeral: true
				});
			}

			await interaction.reply({
				components: [
					new MessageActionRow()
						.addComponents(
							new MessageButton()
								.setCustomId(`confirm_close:${interaction.id}`)
								.setLabel(i18n('commands.close.response.confirm.buttons.confirm'))
								.setEmoji('✅')
								.setStyle('SUCCESS')
						)
						.addComponents(
							new MessageButton()
								.setCustomId(`cancel_close:${interaction.id}`)
								.setLabel(i18n('commands.close.response.confirm.buttons.cancel'))
								.setEmoji('❌')
								.setStyle('SECONDARY')
						)
				],
				embeds: [
					new MessageEmbed()
						.setColor(settings.colour)
						.setTitle(i18n('commands.close.response.confirm.title'))
						.setDescription(settings.log_messages ? i18n('commands.close.response.confirm.description_with_archive') : i18n('commands.close.response.confirm.description'))
						.setFooter(this.client.utils.footer(settings.footer, i18n('collector_expires_in', 30)), interaction.guild.iconURL())
				],
				ephemeral: true
			});


			const filter = i => i.user.id === interaction.user.id && i.customId.includes(interaction.id);
			const collector = interaction.channel.createMessageComponentCollector({
				filter,
				time: 30000
			});

			collector.on('collect', async i => {
				await i.deferUpdate();

				if (i.customId === `confirm_close:${interaction.id}`) {
					await this.client.tickets.close(t_row.id, interaction.user.id, interaction.guild.id, reason);
					await i.editReply({
						components: [],
						embeds: [
							new MessageEmbed()
								.setColor(settings.success_colour)
								.setTitle(i18n('commands.close.response.closed.title', t_row.number))
								.setDescription(i18n('commands.close.response.closed.description', t_row.number))
								.setFooter(settings.footer, interaction.guild.iconURL())
						],
						ephemeral: true
					});

					await this.client.users.fetch(interaction.user.id).then((user) => {
						user.send(`Your ticket '${interaction.channel.name}' has been deleted.`);
					});
					
				} else {
					await i.editReply({
						components: [],
						embeds: [
							new MessageEmbed()
								.setColor(settings.error_colour)
								.setTitle(i18n('commands.close.response.canceled.title'))
								.setDescription(i18n('commands.close.response.canceled.description'))
								.setFooter(settings.footer, interaction.guild.iconURL())
						],
						ephemeral: true
					});
				}

				collector.stop();
			});

			collector.on('end', async collected => {
				if (collected.size === 0) {
					await interaction.editReply({
						components: [],
						embeds: [
							new MessageEmbed()
								.setColor(settings.error_colour)
								.setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
								.setTitle(i18n('commands.close.response.confirmation_timeout.title'))
								.setDescription(i18n('commands.close.response.confirmation_timeout.description'))
								.setFooter(settings.footer, interaction.guild.iconURL())
						],
						ephemeral: true
					});
				}
			});
		}
	}
};
