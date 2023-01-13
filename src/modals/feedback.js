const { Modal } = require('@eartharoid/dbf');
const ExtendedEmbedBuilder = require('../lib/embed');
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
		const rating = parseInt(interaction.fields.getTextInputValue('rating')) || null;

		const ticket = await client.prisma.ticket.update({
			data: {
				feedback: {
					create: {
						comment,
						guild: { connect: { id: interaction.guild.id } },
						rating,
						user: { connect: { id: interaction.user.id } },
					},
				},
			},
			include: { guild: true },
			where: { id: interaction.channel.id },
		});

		if (id.next === 'requestClose') await client.tickets.requestClose(interaction, id.reason);
		else if (id.next === 'acceptClose') await client.tickets.acceptClose(interaction);

		const getMessage = client.i18n.getLocale(ticket.guild.locale);

		// `followUp` must go after `reply`/`editReply` (the above)
		if (comment?.length > 0 && rating !== null) {
			await interaction.followUp({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: ticket.guild.footer,
					})
						.setColor(ticket.guild.primaryColour)
						.setDescription(getMessage('ticket.feedback')),
				],
				ephemeral: true,
			});
		}
	}
};