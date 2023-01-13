const { Button } = require('@eartharoid/dbf');
const ExtendedEmbedBuilder = require('../lib/embed');
const { isStaff } = require('../lib/users');

module.exports = class CloseButton extends Button {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'close',
		});
	}

	/**
	 * @param {*} id
	 * @param {import("discord.js").ButtonInteraction} interaction
	 */
	async run(id, interaction) {
		/** @type {import("client")} */
		const client = this.client;

		// the close button on th opening message, the same as using /close
		if (id.accepted === undefined) {
			await client.tickets.beforeRequestClose(interaction);
		} else {
			await interaction.deferReply();
			const ticket = await client.prisma.ticket.findUnique({
				include: {
					category: true,
					guild: true,
				},
				where: { id: interaction.channel.id },
			});
			const getMessage = client.i18n.getLocale(ticket.guild.locale);
			const staff = await isStaff(interaction.guild, interaction.user.id);

			if (id.expect === 'staff' && !staff) {
				return; // TODO: please wait for staff to close the ticket
			} else if (id.expect === 'user' && staff) {
				return; // TODO: please wait for the user to respond
			} else {
				if (id.accepted) {
					if (
						ticket.createdById === interaction.user.id &&
						ticket.category.enableFeedback &&
						!ticket.feedback
					) {
						return await interaction.showModal(client.tickets.buildFeedbackModal(ticket.guild.locale, { next: 'acceptClose' }));
					} else {
						await client.tickets.acceptClose(interaction);
					}
				} else {
					if (client.tickets.$stale.has(ticket.id)) {
						await interaction.channel.messages.edit(
							client.tickets.$stale.get(ticket.id).message.id,
							{
								components: [],
								embeds: [
									new ExtendedEmbedBuilder({
										iconURL: interaction.guild.iconURL(),
										text: ticket.guild.footer,
									})
										.setColor(ticket.guild.errorColour)
										.setDescription(getMessage('ticket.close.rejected', { user: interaction.user.toString() })),
								],
							},
						);
						client.tickets.$stale.delete(ticket.id);
					}
				}
			}
		}
	}
};