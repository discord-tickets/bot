const { Button } = require('@eartharoid/dbf');
const {
	ActionRowBuilder,
	ModalBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require('discord.js');
const emoji = require('node-emoji');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.ENCRYPTION_KEY);

module.exports = class EditButton extends Button {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'edit',
		});
	}

	async run(id, interaction) {
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

		const getMessage = client.i18n.getLocale(ticket.guild.locale);

		if (ticket.questionAnswers.length === 0) {
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
									.setValue(ticket.topic ? cryptr.decrypt(ticket.topic) : ''),
							),
					),
			);
		} else {
			await interaction.showModal(
				new ModalBuilder()
					.setCustomId(JSON.stringify({
						action: 'questions',
						edit: true,
					}))
					.setTitle(ticket.category.name)
					.setComponents(
						ticket.questionAnswers
							.filter(a => a.question.type === 'TEXT') // TODO: remove this when modals support select menus
							.map(a => {
								if (a.question.type === 'TEXT') {
									return new ActionRowBuilder()
										.setComponents(
											new TextInputBuilder()
												.setCustomId(String(a.id))
												.setLabel(a.question.label)
												.setStyle(a.question.style)
												.setMaxLength(Math.min(a.question.maxLength, 1000))
												.setMinLength(a.question.minLength)
												.setPlaceholder(a.question.placeholder)
												.setRequired(a.question.required)
												.setValue(a.value ? cryptr.decrypt(a.value) : a.question.value),
										);
								} else if (a.question.type === 'MENU') {
									return new ActionRowBuilder()
										.setComponents(
											new StringSelectMenuBuilder()
												.setCustomId(a.question.id)
												.setPlaceholder(a.question.placeholder || a.question.label)
												.setMaxValues(a.question.maxLength)
												.setMinValues(a.question.minLength)
												.setOptions(
													a.question.options.map((o, i) => {
														const builder = new StringSelectMenuOptionBuilder()
															.setValue(String(i))
															.setLabel(o.label);
														if (o.description) builder.setDescription(o.description);
														if (o.emoji) builder.setEmoji(emoji.hasEmoji(o.emoji) ? emoji.get(o.emoji) : { id: o.emoji });
														return builder;
													}),
												),
										);
								}
							}),
					),
			);
		}
	}
};
