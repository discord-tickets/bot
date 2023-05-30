const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client,
			event: 'guildMemberRemove',
		});
	}

	/**
	 *
	 * @param {import("discord.js").GuildMember} member
	 */
	async run(member) {
		/** @type {import("client")} */
		const client = this.client;

		const tickets = await client.prisma.ticket.findMany({
			where: {
				createdById: member.id,
				guildId: member.guild.id,
				open: true,
			},
		});

		for (const ticket of tickets) {
			await client.tickets.finallyClose(ticket.id, { reason: 'user left server' });
		}
	}
};
