const { SlashCommand } = require('@eartharoid/dbf');
const {
	ApplicationCommandOptionType,
	EmbedBuilder,
} = require('discord.js');
const ExtendedEmbedBuilder = require('../../lib/embed');
const { quick } = require('../../lib/threads');


module.exports = class TransferSlashCommand extends SlashCommand {
	constructor(client, options) {
		const name = 'transfer';
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
					required: true,
					type: ApplicationCommandOptionType.User,
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

		await interaction.deferReply();

		const member = interaction.options.getMember('member', true);

		const ticket = await client.prisma.ticket.findUnique({
			include: {
				category: true,
				guild: true,
			},
			where: { id: interaction.channel.id },
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
						.setTitle(getMessage('misc.not_ticket.title'))
						.setDescription(getMessage('misc.not_ticket.description')),
				],
			});
		}

		const from = ticket.createdById;

		const channelName = ticket.category.channelName
			.replace(/{+\s?(user)?name\s?}+/gi, member.user.username)
			.replace(/{+\s?(nick|display)(name)?\s?}+/gi, member.displayName)
			.replace(/{+\s?num(ber)?\s?}+/gi, ticket.number === 1488 ? '1487b' : ticket.number);

		await Promise.all([
			client.prisma.ticket.update({
				data: {
					createdBy: {
						connectOrCreate: {
							create: { id: member.id },
							where: { id: member.id },
						},
					},
				},
				where: { id: interaction.channel.id },
			}),
			interaction.channel.edit({
				name: channelName,
				topic: `${member.toString()}${ticket.topic && ` | ${await quick('crypto', w => w.decrypt(ticket.topic))}`}`,
			}),
			interaction.channel.permissionOverwrites.edit(
				member,
				{
					AttachFiles: true,
					EmbedLinks: true,
					ReadMessageHistory: true,
					SendMessages: true,
					ViewChannel: true,
				},
			),
		]);

		const $category = client.tickets.$count.categories[ticket.categoryId];
		$category[from]--;
		$category[member.id] ||= 0;
		$category[member.id]++;

		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(ticket.guild.primaryColour)
					.setDescription(client.i18n.getMessage(ticket.guild.locale, `commands.slash.transfer.transferred${interaction.member.id !== from ? '_from' : ''}`, {
						from: `<@${from}>`,
						to: member.toString(),
						user: interaction.user.toString(),
					})),

			],
		});

	}
};
