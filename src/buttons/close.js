const { Button } = require('@eartharoid/dbf');
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
			await client.tickets.beforeRequestClose(interaction);
		} else {
		// {
		// 	action: 'close',
		// 	expect: staff ? 'user' : 'staff',
		// 	reason: interaction.options?.getString('reason', false) || null, // ?. because it could be a button interaction
		// 	requestedBy: interaction.user.id,
		// }

			await interaction.deferReply();
			const ticket = await client.prisma.ticket.findUnique({
				include: { guild: true },
				where: { id: interaction.channel.id },
			});

			if (id.expect === 'staff' && !await isStaff(interaction.guild, interaction.user.id)) {
				return;
			} else if (interaction.user.id !== ticket.createdById) {
				return;
				// if user and expect user (or is creator), feedback modal (if enabled)
				// otherwise add "Give feedback" button in DM message (if enabled)
			}
		}
	}
};