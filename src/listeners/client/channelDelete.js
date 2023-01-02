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
		if (!ticket) return;

		await client.tickets.close(ticket.id, true, 'channel deleted');
		this.client.log.info(`Closed ticket ${ticket.id} because the channel was deleted`);
	}
};
