const { Modal } = require('@eartharoid/dbf');
const { EmbedBuilder } = require('discord.js');
const ExtendedEmbedBuilder = require('../lib/embed');
const { logTicketEvent } = require('../lib/logging');
const { reusable } = require('../lib/threads');


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
				await interaction.deferReply({ ephemeral: true });

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
							await Promise.all(
								ticket.questionAnswers
									.map(async a => ({
										name: a.question.label,
										value: a.value ? await worker.decrypt(a.value) : getMessage('ticket.answers.no_value'),
									})),
							),
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

				/** @param {ticket} ticket */
				const makeDiff = async ticket => {
					const diff = {};
					for (const a of ticket.questionAnswers) {
						diff[a.question.label] = a.value ? await worker.decrypt(a.value) : getMessage('ticket.answers.no_value');
					}
					return diff;
				};

				logTicketEvent(this.client, {
					action: 'update',
					diff: {
						original: await makeDiff(original),
						updated: await makeDiff(ticket),
					},
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
