const { Modal } = require('@eartharoid/dbf');
const ExtendedEmbedBuilder = require('../lib/embed');
const { MessageFlags } = require('discord.js');
const { pools } = require('../lib/threads');

const { crypto } = pools;
module.exports = class FeedbackModal extends Modal {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'feedback',
		});
	}

	/**
	 * @param {*} id
	 * @param {import("discord.js").ModalSubmitInteraction} interaction
	 */
	async run(id, interaction) {
		/** @type {import("client")} */
		const client = this.client;

		await interaction.deferReply();

		const comment = interaction.fields.getTextInputValue('comment');
		let rating = parseInt(interaction.fields.getTextInputValue('rating')) || null;
		rating = Math.min(Math.max(rating, 1), 5);

		const data = {
			comment: comment?.length > 0 ? await crypto.queue(w => w.encrypt(comment)) : null,
			guild: { connect: { id: interaction.guild.id } },
			rating,
			user: { connect: { id: interaction.user.id } },
		};
		const ticket = await client.prisma.ticket.update({
			data: {
				feedback: {
					upsert: {
						create: data,
						update: data,
					},
				},
			},
			include: { guild: true },
			where: { id: interaction.channel.id },
		});

		if (id.next === 'requestClose') await client.tickets.requestClose(interaction, id.reason);
		else if (id.next === 'acceptClose') await client.tickets.acceptClose(interaction);

		const getMessage = client.i18n.getLocale(ticket.guild.locale);

		// Send feedback confirmation if channel is still accessible
		if (comment?.length > 0 && rating !== null) {
			try {
				await interaction.followUp({
					embeds: [
						new ExtendedEmbedBuilder({
							iconURL: interaction.guild.iconURL(),
							text: ticket.guild.footer,
						})
							.setColor(ticket.guild.primaryColour)
							.setDescription(getMessage('ticket.feedback')),
					],
					flags: MessageFlags.Ephemeral,
				});
			} catch (error) {
				if (error.code === 10003 || error.code === 10008) {
					// Channel was deleted during ticket closure - this is expected
					client.log.debug('Feedback message not sent: channel no longer exists');
				} else {
					client.log.error('Unable to send feedback confirmation:', error);
				}
			}
		}
	}
};
