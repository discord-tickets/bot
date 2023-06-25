const { Modal } = require('@eartharoid/dbf');
const { EmbedBuilder } = require('discord.js');
const ExtendedEmbedBuilder = require('../lib/embed');
const { logTicketEvent } = require('../lib/logging');
const Cryptr = require('cryptr');
const {
	encrypt,
	decrypt,
} = new Cryptr(process.env.ENCRYPTION_KEY);

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
						update: interaction.fields.fields.map(f => ({
							data: { value: f.value ? encrypt(f.value) : '' },
							where: { id: Number(f.customId) },
						})),
					},
					topic: topic ? encrypt(topic) : null,
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
						ticket.questionAnswers
							.map(a => ({
								name: a.question.label,
								value: a.value ? decrypt(a.value) : getMessage('ticket.answers.no_value'),
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

			/** @param {ticket} ticket */
			const makeDiff = ticket => {
				const diff = {};
				ticket.questionAnswers.forEach(a => {
					diff[a.question.label] = a.value ? decrypt(a.value) : getMessage('ticket.answers.no_value');
				});
				return diff;
			};

			logTicketEvent(this.client, {
				action: 'update',
				diff: {
					original: makeDiff(original),
					updated: makeDiff(ticket),
				},
				target: {
					id: ticket.id,
					name: `<#${ticket.id}>`,
				},
				userId: interaction.user.id,
			});
		} else {
			await this.client.tickets.postQuestions({
				...id,
				interaction,
			});
		}
	}
};
