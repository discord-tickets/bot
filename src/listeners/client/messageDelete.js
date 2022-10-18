const { Listener } = require('@eartharoid/dbf');
const { logMessageEvent } = require('../../lib/logging');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client,
			event: 'messageDelete',
		});
	}

	/**
	 * @param {import("discord.js").Message} oldMessage
	 * @param {import("discord.js").Message} message
	 */
	async run(message) {
		/** @type {import("client")} */
		const client = this.client;

		if (message.partial) message.fetch().then(m => (message = m)).catch(client.log.error);
		const ticket = await client.prisma.ticket.findUnique({
			include: { guild: true },
			where: { id: message.channel.id },
		});
		if (!ticket) return;

		if (ticket.guild.archive) {
			try {
				const archived = await client.prisma.archivedMessage.findUnique({ where: { id: message.id } });
				if (archived) {
					await client.prisma.archivedMessage.update({
						data: { deleted: true },
						where: { id: message.id },
					});
				}
			} catch (error) {
				client.log.warn('Failed to "delete" archived message', message.id);
				client.log.error(error);
			}
		}

		await logMessageEvent(this.client, {
			action: 'delete',
			diff: {
				original: { content: message.cleanContent },
				updated: { content: '' },
			},
			target: message,
			ticket,
		});
	}
};
