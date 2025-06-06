const { Modal } = require('@eartharoid/dbf');
const {
	EmbedBuilder, MessageFlags,
} = require('discord.js');
const ExtendedEmbedBuilder = require('../lib/embed');
const { logTicketEvent } = require('../lib/logging');
const { reusable } = require('../lib/threads');
const { cleanCodeBlockContent } = require('discord.js');


module.exports = class QuestionsModal extends Modal {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'questions',
		});
	}

	/**
	 *
	 * @param {*} id
	 * @param {import("discord.js").ModalSubmitInteraction} interaction
	 */
	async run(id, interaction) {
		/** @type {import("client")} */
		const client = this.client;

		if (id.edit) {
			const worker = await reusable('crypto');
			try {
				await interaction.deferReply({ flags: MessageFlags.Ephemeral });

				const { category } = await client.prisma.ticket.findUnique({
					select: { category: { select: { customTopic: true } } },
					where: { id: interaction.channel.id },
				});
				const select = {
					createdById: true,
					guild: {
						select: {
							footer: true,
							locale: true,
							primaryColour: true,
							successColour: true,
						},
					},
					id: true,
					openingMessageId: true,
					questionAnswers: { include: { question: true } },
				};
				const original = await client.prisma.ticket.findUnique({
					select,
					where: { id: interaction.channel.id },
				});

				const plainTextAnswers = await Promise.all(
					original.questionAnswers
						.map(async answer => ({
							after: interaction.fields.getTextInputValue(String(answer.id)),
							before: answer.value ? await worker.decrypt(answer.value) : '',
							id: answer.id,
							question: answer.question,
						})),
				);

				let topic;
				if (category.customTopic) {
					const customTopicAnswer = original.questionAnswers.find(a => a.question.id === category.customTopic);
					if (!customTopicAnswer) throw new Error('Custom topic answer not found');
					topic = interaction.fields.getTextInputValue(String(customTopicAnswer.id));
				}

				const ticket = await client.prisma.ticket.update({
					data: {
						questionAnswers: {
							update: await Promise.all(
								interaction.fields.fields
									.map(async f => ({
										data: { value: f.value ? await worker.encrypt(f.value) : '' },
										where: { id: Number(f.customId) },
									})),
							),
						},
						topic: topic ? await worker.encrypt(topic) : null,
					},
					select,
					where: { id: interaction.channel.id },
				});
				const getMessage = client.i18n.getLocale(ticket.guild.locale);

				if (topic) await interaction.channel.setTopic(`<@${ticket.createdById}> | ${topic}`);

				const opening = await interaction.channel.messages.fetch(ticket.openingMessageId);
				if (opening && opening.embeds.length >= 2) {
					const embeds = [...opening.embeds];
					embeds[1] = new EmbedBuilder(embeds[1].data)
						.setFields(
							plainTextAnswers
								.map(a => ({
									name: a.question.label,
									value: a.after || getMessage('ticket.answers.no_value'),
								})),
						);
					await opening.edit({ embeds });
				}

				await interaction.editReply({
					embeds: [
						new ExtendedEmbedBuilder({
							iconURL: interaction.guild.iconURL(),
							text: ticket.guild.footer,
						})
							.setColor(ticket.guild.successColour)
							.setTitle(getMessage('ticket.edited.title'))
							.setDescription(getMessage('ticket.edited.description')),
					],
				});

				const diff = {
					original: {},
					updated: {},
				};
				const inlineDiffEmbeds = [];

				for (const answer of plainTextAnswers) {
					diff.original[answer.question.label] = answer.before || getMessage('ticket.answers.no_value');
					diff.updated[answer.question.label] = answer.after || getMessage('ticket.answers.no_value');
					if (answer.before !== answer.after) {
						const from = answer.before ? answer.before.replace(/^/gm, '- ') + '\n' : '';
						const to = answer.after ? answer.after.replace(/^/gm, '+ ') + '\n' : '';
						inlineDiffEmbeds.push(
							new EmbedBuilder()
								.setColor(ticket.guild.primaryColour)
								.setAuthor({
									iconURL: interaction.member.displayAvatarURL(),
									name: interaction.user.username,
								})
								.setTitle(answer.question.label)
								.setDescription(`\`\`\`diff\n${cleanCodeBlockContent(from + to)}\n\`\`\``),
						);
					}
				}

				if (inlineDiffEmbeds.length) {
					await interaction.followUp({ embeds: inlineDiffEmbeds });
				}

				logTicketEvent(this.client, {
					action: 'update',
					diff,
					target: {
						id: ticket.id,
						name: `<#${ticket.id}>`,
					},
					userId: interaction.user.id,
				});
			} finally {
				await worker.terminate();
			}
		} else {
			await this.client.tickets.postQuestions({
				...id,
				interaction,
			});
		}
	}
};
