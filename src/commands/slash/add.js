const { SlashCommand } = require('@eartharoid/dbf');
const {
	ApplicationCommandOptionType,
	MessageFlags,
} = require('discord.js');
const ExtendedEmbedBuilder = require('../../lib/embed');
const { isStaff } = require('../../lib/users');
const { logTicketEvent } = require('../../lib/logging');

module.exports = class AddSlashCommand extends SlashCommand {
	constructor(client, options) {
		const name = 'add';
		super(client, {
			...options,
			description: client.i18n.getMessage(null, `commands.slash.${name}.description`),
			descriptionLocalizations: client.i18n.getAllMessages(`commands.slash.${name}.description`),
			dmPermission: false,
			name,
			nameLocalizations: client.i18n.getAllMessages(`commands.slash.${name}.name`),
			options: [
				{
					name: 'member',
					required: false,
					type: ApplicationCommandOptionType.User,
				},
				{
					name: 'role',
					required: false,
					type: ApplicationCommandOptionType.Role,
				},
				{
					autocomplete: true,
					name: 'ticket',
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
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 */
	async run(interaction) {
		/** @type {import('client')} */
		const client = this.client;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const ticket = await client.prisma.ticket.findUnique({
			include: { guild: true },
			where: { id: interaction.options.getString('ticket', false) || interaction.channel.id },
		});

		if (!ticket) {
			const settings = await client.prisma.guild.findUnique({ where: { id: interaction.guild.id } });
			const getMessage = client.i18n.getLocale(settings.locale);
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

		const getMessage = client.i18n.getLocale(ticket.guild.locale);

		if (
			ticket.id !== interaction.channel.id &&
			ticket.createdById !== interaction.member.id &&
			!(await isStaff(interaction.guild, interaction.member.id))
		) {
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: ticket.guild.footer,
					})
						.setColor(ticket.guild.errorColour)
						.setTitle(getMessage('commands.slash.add.not_staff.title'))
						.setDescription(getMessage('commands.slash.add.not_staff.description')),
				],
			});
		}

		/** @type {import('discord.js').TextChannel} */
		const ticketChannel = await interaction.guild.channels.fetch(ticket.id);
		const member = interaction.options.getMember('member', true);
		const role = interaction.options.getRole('role', false);

		if (!member && !role) {
			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: ticket.guild.footer,
					})
						.setColor(ticket.guild.errorColour)
						.setTitle(getMessage('commands.slash.add.no_args.title'))
						.setDescription(getMessage('commands.slash.add.no_args.description')),
				],
			});
		}

		if (member) {

			await ticketChannel.permissionOverwrites.edit(
				member,
				{
					AttachFiles: true,
					EmbedLinks: true,
					ReadMessageHistory: true,
					SendMessages: true,
					ViewChannel: true,
				},
				`${interaction.user.tag} added ${member.user.tag} to the ticket`,
			);


			await ticketChannel.send({
				embeds: [
					new ExtendedEmbedBuilder()
						.setColor(ticket.guild.primaryColour)
						.setDescription(getMessage('commands.slash.add.added', {
							added: member.toString(),
							by: interaction.member.toString(),
						})),
				],
			});

		}

		if (role) {

			await ticketChannel.permissionOverwrites.edit(
				role,
				{
					AttachFiles: true,
					EmbedLinks: true,
					ReadMessageHistory: true,
					SendMessages: true,
					ViewChannel: true,
				},
				`${interaction.user.tag} added ${role.name} to the ticket`,
			);


			await ticketChannel.send({
				embeds: [
					new ExtendedEmbedBuilder()
						.setColor(ticket.guild.primaryColour)
						.setDescription(getMessage('commands.slash.add.added', {
							added: role.toString(),
							by: interaction.member.toString(),
						})),
				],
			});

		}


		await interaction.editReply({
			embeds: [
				new ExtendedEmbedBuilder({
					iconURL: interaction.guild.iconURL(),
					text: ticket.guild.footer,
				})
					.setColor(ticket.guild.successColour)
					.setTitle(getMessage('commands.slash.add.success.title'))
					.setDescription(getMessage('commands.slash.add.success.description', {
						args: [member?.toString(), role?.toString()].filter(Boolean).join(' & '),
						ticket: ticketChannel.toString(),
					})),
			],
		});

		if (member) {
			logTicketEvent(this.client, {
				action: 'update',
				diff: {
					original: {},
					updated: { [getMessage('log.ticket.addedMember')]: member.user.tag },
				},
				target: {
					id: ticket.id,
					name: `<#${ticket.id}>`,
				},
				userId: interaction.user.id,
			});
		}

		if (role) {
			logTicketEvent(this.client, {
				action: 'update',
				diff: {
					original: {},
					updated: { [getMessage('log.ticket.addedRole')]: role.name },
				},
				target: {
					id: ticket.id,
					name: `<#${ticket.id}>`,
				},
				userId: interaction.user.id,
			});
		}

	}
};
