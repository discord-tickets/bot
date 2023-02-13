const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client,
			event: 'channelDelete',
		});
	}

	async run(channel) {
		/** @type {import("client")} */
		const client = this.client;

		const ticket = await client.prisma.ticket.findUnique({
			include: { guild: true },
			where: { id: channel.id },
		});

		if (ticket?.open) {
			await client.tickets.finallyClose(ticket.id, { reason: 'channel deleted' });
			this.client.log.info.tickets(`Closed ticket ${ticket.id} because the channel was deleted`);
		}
	}
};
