const { Modal } = require('@eartharoid/dbf');

module.exports = class FeedbackModal extends Modal {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'feedback',
		});
	}

	async run(id, interaction) {
		/** @type {import("client")} */
		const client = this.client;

		await interaction.deferReply();
		await client.prisma.ticket.update({
			data: {
				feedback: {
					create: {
						comment: interaction.fields.getTextInputValue('comment'),
						guild: { connect: { id: interaction.guild.id } },
						rating: parseInt(interaction.fields.getTextInputValue('rating')) || null,
						user: { connect: { id: interaction.user.id } },
					},
				},
			},
			where: { id: interaction.channel.id },
		});
		await client.tickets.requestClose(interaction, id.reason);
	}
};