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

		if (id.accepted === undefined) {
			// the close button on the opening message, the same as using /close
			await client.tickets.beforeRequestClose(interaction);
		} else {
			const ticket = await client.tickets.getTicket(interaction.channel.id, true); // true to override cache and load new feedback
			const getMessage = client.i18n.getLocale(ticket.guild.locale);
			const staff = await isStaff(interaction.guild, interaction.user.id);

			if (id.expect === 'staff' && !staff) {
				return await interaction.reply({
					embeds: [
						new ExtendedEmbedBuilder()
							.setColor(ticket.guild.errorColour)
							.setDescription(getMessage('ticket.close.wait_for_staff')),
					],
					ephemeral: true,
				});
			} else if (id.expect === 'user' && interaction.user.id !== ticket.createdById) {
				return await interaction.reply({
					embeds: [
						new ExtendedEmbedBuilder()
							.setColor(ticket.guild.errorColour)
							.setDescription(getMessage('ticket.close.wait_for_user')),
					],
					ephemeral: true,
				});
			} else {
				if (id.accepted) {
					if (
						ticket.createdById === interaction.user.id &&
						ticket.category.enableFeedback &&
						!ticket.feedback
					) {
						return await interaction.showModal(client.tickets.buildFeedbackModal(ticket.guild.locale, { next: 'acceptClose' }));
					} else {
						await interaction.deferReply();
						await client.tickets.acceptClose(interaction);
					}
				} else {
					try {
						await interaction.update({
							components: [],
							embeds: [
								new ExtendedEmbedBuilder({
									iconURL: interaction.guild.iconURL(),
									text: ticket.guild.footer,
								})
									.setColor(ticket.guild.errorColour)
									.setDescription(getMessage('ticket.close.rejected', { user: interaction.user.toString() }))
									.setFooter({ text: null }),
							],
						});

					} finally { // this should run regardless of whatever happens above
						client.tickets.$stale.delete(ticket.id);
					}
				}
			}
		}
	}
};
