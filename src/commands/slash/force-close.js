const { SlashCommand } = require('@eartharoid/dbf');
const {
	ApplicationCommandOptionType,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
} = require('discord.js');
const ExtendedEmbedBuilder = require('../../lib/embed');
const { isStaff } = require('../../lib/users');
const ms = require('ms');

module.exports = class ForceCloseSlashCommand extends SlashCommand {
	constructor(client, options) {
		const name = 'force-close';
		super(client, {
			...options,
			description: client.i18n.getMessage(null, `commands.slash.${name}.description`),
			descriptionLocalizations: client.i18n.getAllMessages(`commands.slash.${name}.description`),
			dmPermission: false,
			name,
			nameLocalizations: client.i18n.getAllMessages(`commands.slash.${name}.name`),
			options: [
				{
					autocomplete: true,
					name: 'category',
					required: false,
					type: ApplicationCommandOptionType.Integer,
				},
				{
					name: 'reason',
					required: false,
					type: ApplicationCommandOptionType.String,
				},
				{
					autocomplete: true,
					name: 'ticket',
					required: false,
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'time',
					required: false,
					type: ApplicationCommandOptionType.String,
				},
			].map(option => {
				option.descriptionLocalizations = client.i18n.getAllMessages(`commands.slash.${name}.options.${option.name}.description`);
				option.description = option.descriptionLocalizations['en-GB'];
				option.nameLocalizations = client.i18n.getAllMessages(`commands.slash.${name}.options.${option.name}.name`);
				return option;
			}),
		});
	}

	/**
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 */
	async run(interaction) {
		/** @type {import("client")} */
		const client = this.client;

		await interaction.deferReply({ ephemeral: true });

		const settings = await client.prisma.guild.findUnique({ where: { id: interaction.guild.id } });
		const getMessage = client.i18n.getLocale(settings.locale);
		let ticket;

		if (!(await isStaff(interaction.guild, interaction.user.id))) { // if user is not staff
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: settings.footer,
					})
						.setColor(settings.errorColour)
						.setTitle(getMessage('commands.slash.force-close.not_staff.title'))
						.setDescription(getMessage('commands.slash.force-close.not_staff.description')),
				],
			});
		}

		if (interaction.options.getString('ticket', false)) { // if ticket option is passed
			ticket = await client.prisma.ticket.findUnique({
				include: { category: true },
				where: { id: interaction.options.getString('ticket') },
			});

			if (!ticket) {
				return await interaction.editReply({
					embeds: [
						new ExtendedEmbedBuilder({
							iconURL: interaction.guild.iconURL(),
							text: settings.footer,
						})
							.setColor(settings.errorColour)
							.setTitle(getMessage('misc.invalid_ticket.title'))
							.setDescription(getMessage('misc.invalid_ticket.description')),
					],
				});
			}

			await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: settings.footer,
					})
						.setColor(settings.successColour)
						.setTitle(getMessage('commands.slash.force-close.closed_one.title'))
						.setDescription(getMessage('commands.slash.force-close.closed_one.description', { ticket: ticket.id })),
				],
			});

			setTimeout(async () => {
				await client.tickets.finallyClose(ticket.id, {
					closedBy: interaction.user.id,
					reason: interaction.options.getString('reason', false),
				});
			}, ms('3s'));

		} else if (interaction.options.getString('time', false)) { // if time option is passed
			const time = ms(interaction.options.getString('time', false));

			if (!time) {
				return await interaction.editReply({
					embeds: [
						new ExtendedEmbedBuilder({
							iconURL: interaction.guild.iconURL(),
							text: settings.footer,
						})
							.setColor(settings.errorColour)
							.setTitle(getMessage('commands.slash.close.invalid_time.title'))
							.setDescription(getMessage('commands.slash.close.invalid_time.description', { input: interaction.options.getString('time', false) })),
					],
				});
			}

			const categoryId = interaction.options.getInteger('category', false);
			const tickets = await client.prisma.ticket.findMany({
				where: {
					categoryId: categoryId ?? undefined, // must be undefined not null
					guildId: interaction.guild.id,
					lastMessageAt: { lte: new Date(Date.now() - time) },
					open: true,
				},
			});

			if (tickets.length === 0) {
				return await interaction.editReply({
					embeds: [
						new ExtendedEmbedBuilder({
							iconURL: interaction.guild.iconURL(),
							text: settings.footer,
						})
							.setColor(settings.errorColour)
							.setTitle(getMessage('commands.slash.force-close.no_tickets.title'))
							.setDescription(getMessage('commands.slash.force-close.no_tickets.description', { time: ms(time, { long: true }) })),
					],
				});
			}

			const collectorTime = ms('15s');
			const confirmationM = await interaction.editReply({
				components: [
					new ActionRowBuilder()
						.addComponents([
							new ButtonBuilder()
								.setCustomId(JSON.stringify({
									action: 'custom',
									id: 'close',
								}))
								.setStyle(ButtonStyle.Danger)
								.setEmoji(getMessage('buttons.close.emoji'))
								.setLabel(getMessage('buttons.close.text')),
							new ButtonBuilder()
								.setCustomId(JSON.stringify({
									action: 'custom',
									id: 'cancel',
								}))
								.setStyle(ButtonStyle.Secondary)
								.setEmoji(getMessage('buttons.cancel.emoji'))
								.setLabel(getMessage('buttons.cancel.text')),
						]),
				],
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: getMessage('misc.expires_in', { time: ms(collectorTime, { long: true }) }),
					})
						.setColor(settings.primaryColour)
						.setTitle(getMessage('commands.slash.force-close.confirm_multiple.title'))
						.setDescription(getMessage('commands.slash.force-close.confirm_multiple.description', {
							count: tickets.length,
							tickets: tickets.map(t => `> <#${t.id}>`).join('\n'),
							time: ms(time, { long: true }),
						})),
				],
			});

			confirmationM.awaitMessageComponent({
				componentType: ComponentType.Button,
				filter: i => i.user.id === interaction.user.id,
				time: collectorTime,
			})
				.then(async i => {
					if (JSON.parse(i.customId).id === 'close') {
						await i.reply({
							components: [],
							embeds: [
								new ExtendedEmbedBuilder({
									iconURL: interaction.guild.iconURL(),
									text: settings.footer,
								})
									.setColor(settings.successColour)
									.setTitle(getMessage('commands.slash.force-close.confirmed_multiple.title', tickets.length, tickets.length))
									.setDescription(getMessage('commands.slash.force-close.confirmed_multiple.description')),
							],
							ephemeral: true,
						});
						setTimeout(async () => {
							for (const ticket of tickets) {
								await client.tickets.finallyClose(ticket.id, {
									closedBy: interaction.user.id,
									reason: interaction.options.getString('reason', false),
								});
							}
						}, ms('3s'));
					} else {
						await interaction.deleteReply();
					}
				})
				.catch(async error => {
					client.log.error(error);
					await interaction.reply({
						components: [],
						embeds: [
							new ExtendedEmbedBuilder({
								iconURL: interaction.guild.iconURL(),
								text: settings.footer,
							})
								.setColor(settings.errorColour)
								.setTitle(getMessage('misc.expired.title'))
								.setDescription(getMessage('misc.expired.description', { time: ms(time, { long: true }) })),
						],
					});
				});
		} else {
			ticket = await client.prisma.ticket.findUnique({
				include: { category: true },
				where: { id: interaction.channel.id },
			});

			if (!ticket) {
				return await interaction.editReply({
					embeds: [
						new ExtendedEmbedBuilder({
							iconURL: interaction.guild.iconURL(),
							text: settings.footer,
						})
							.setColor(settings.errorColour)
							.setTitle(getMessage('misc.not_ticket.title'))
							.setDescription(getMessage('misc.not_ticket.description')),
					],
				});
			}

			await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: settings.footer,
					})
						.setColor(settings.successColour)
						.setTitle(getMessage('commands.slash.force-close.closed_one.title'))
						.setDescription(getMessage('commands.slash.force-close.closed_one.description', { ticket: ticket.id })),
				],
			});

			setTimeout(async () => {
				await client.tickets.finallyClose(ticket.id, {
					closedBy: interaction.user.id,
					reason: interaction.options.getString('reason', false),
				});
			}, ms('3s'));
		}
	}
};
