const { Modal } = require('@eartharoid/dbf');
const {
	EmbedBuilder, MessageFlags,
} = require('discord.js');
const ExtendedEmbedBuilder = require('../lib/embed');
const { logTicketEvent } = require('../lib/logging');
const { reusable } = require('../lib/threads');

module.exports = class TopicModal extends Modal {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'topic',
		});
	}

	async run(id, interaction) {
		/** @type {import("client")} */
		const client = this.client;

		if (id.edit) {
			const worker = await reusable('crypto');
			try {
				await interaction.deferReply({ flags: MessageFlags.Ephemeral });
				const topic = interaction.fields.getTextInputValue('topic');
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
					topic: true,
				};
				const original = await client.prisma.ticket.findUnique({
					select,
					where: { id: interaction.channel.id },
				});
				const ticket = await client.prisma.ticket.update({
					data: { topic: topic ? await worker.encrypt(topic) : null },
					select,
					where: { id: interaction.channel.id },
				});
				const getMessage = client.i18n.getLocale(ticket.guild.locale);

				if (topic) interaction.channel.setTopic(`<@${ticket.createdById}> | ${topic}`);

				const opening = await interaction.channel.messages.fetch(ticket.openingMessageId);
				if (opening && opening.embeds.length >= 2) {
					const embeds = [...opening.embeds];
					embeds[1] = new EmbedBuilder(embeds[1].data)
						.setFields({
							name: getMessage('ticket.opening_message.fields.topic'),
							value: topic,
						});
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
					diff[getMessage('ticket.opening_message.fields.topic')] = ticket.topic ? await worker.decrypt(ticket.topic) : ' ';
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
