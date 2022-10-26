const { SlashCommand } = require('@eartharoid/dbf');
const {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require('discord.js');
const Cryptr = require('cryptr');
const { decrypt } = new Cryptr(process.env.ENCRYPTION_KEY);
const ExtendedEmbedBuilder = require('../../lib/embed');

module.exports = class TopicSlashCommand extends SlashCommand {
	constructor(client, options) {
		const descriptionLocalizations = {};
		client.i18n.locales.forEach(l => (descriptionLocalizations[l] = client.i18n.getMessage(l, 'commands.slash.topic.description')));

		const nameLocalizations = {};
		client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, 'commands.slash.topic.name')));

		super(client, {
			...options,
			description: descriptionLocalizations['en-GB'],
			descriptionLocalizations,
			dmPermission: false,
			name: nameLocalizations['en-GB'],
			nameLocalizations,
		});
	}

	/**
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 */
	async run(interaction) {
		/** @type {import("client")} */
		const client = this.client;

		const ticket = await client.prisma.ticket.findUnique({
			select: {
				category: { select: { name: true } },
				guild: { select: { locale: true } },
				questionAnswers: { include: { question: true } },
				topic: true,
			},
			where: { id: interaction.channel.id },
		});

		if (!ticket) {
			const settings = await client.prisma.guild.findUnique({ where: { id: interaction.guild.id } });
			const getMessage = client.i18n.getLocale(settings.locale);
			return await interaction.reply({
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

		const getMessage = client.i18n.getLocale(ticket.guild.locale);

		await interaction.showModal(
			new ModalBuilder()
				.setCustomId(JSON.stringify({
					action: 'topic',
					edit: true,
				}))
				.setTitle(ticket.category.name)
				.setComponents(
					new ActionRowBuilder()
						.setComponents(
							new TextInputBuilder()
								.setCustomId('topic')
								.setLabel(getMessage('modals.topic.label'))
								.setStyle(TextInputStyle.Paragraph)
								.setMaxLength(1000)
								.setMinLength(5)
								.setPlaceholder(getMessage('modals.topic.placeholder'))
								.setRequired(true)
								.setValue(ticket.topic ? decrypt(ticket.topic) : ''),
						),
				),
		);
	}
};