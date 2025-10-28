const { SlashCommand } = require('@eartharoid/dbf');
const {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	MessageFlags,
} = require('discord.js');
const ExtendedEmbedBuilder = require('../../lib/embed');
const { pools } = require('../../lib/threads');

const { crypto } = pools;

module.exports = class TopicSlashCommand extends SlashCommand {
	constructor(client, options) {
		const name = 'topic';
		super(client, {
			...options,
			description: client.i18n.getMessage(null, `commands.slash.${name}.description`),
			descriptionLocalizations: client.i18n.getAllMessages(`commands.slash.${name}.description`),
			dmPermission: false,
			name,
			nameLocalizations: client.i18n.getAllMessages(`commands.slash.${name}.name`),
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
				flags: MessageFlags.Ephemeral,
			});
		}

		const getMessage = client.i18n.getLocale(ticket.guild.locale);

		const field = new TextInputBuilder()
			.setCustomId('topic')
			.setLabel(getMessage('modals.topic.label'))
			.setStyle(TextInputStyle.Paragraph)
			.setMaxLength(100)
			.setMinLength(5)
			.setPlaceholder(getMessage('modals.topic.placeholder'))
			.setRequired(true);

		// why can't discord.js accept null or undefined :(
		if (ticket.topic) field.setValue(await crypto.queue(w => w.decrypt(ticket.topic)));

		await interaction.showModal(
			new ModalBuilder()
				.setCustomId(JSON.stringify({
					action: 'topic',
					edit: true,
				}))
				.setTitle(ticket.category.name)
				.setComponents(
					new ActionRowBuilder()
						.setComponents(field),
				),
		);
	}
};
