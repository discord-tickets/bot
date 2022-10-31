const { SlashCommand } = require('@eartharoid/dbf');
const {
	ApplicationCommandOptionType,
	EmbedBuilder,
} = require('discord.js');
const Cryptr = require('cryptr');
const { decrypt } = new Cryptr(process.env.ENCRYPTION_KEY);

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

		await interaction.deferReply({ ephemeral: false });

		const member = interaction.options.getMember('member', true);

		let ticket = await client.prisma.ticket.findUnique({ where: { id: interaction.channel.id } });
		const from = ticket.createdById;

		ticket = await client.prisma.ticket.update({
			data: {
				createdBy: {
					connectOrCreate: {
						create: { id: member.id },
						where: { id: member.id },
					},
				},
			},
			include: { guild: true },
			where: { id: interaction.channel.id },
		});

		await interaction.channel.setTopic(`${member.toString()}${ticket.topic?.length > 0 ? ` | ${decrypt(ticket.topic)}` : ''}`);

		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(ticket.guild.primaryColour)
					.setDescription(client.i18n.getMessage(ticket.guild.locale, 'commands.slash.transfer.transferred', {
						from: `<@${from}>`,
						to: member.toString(),
						user: interaction.user.toString(),
					})),

			],
		});
	}
};
