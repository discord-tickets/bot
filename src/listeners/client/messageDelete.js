const { Listener } = require('@eartharoid/dbf');
const {
	AuditLogEvent, MessageFlags,
} = require('discord.js');
const { logMessageEvent } = require('../../lib/logging');
const { pools } = require('../../lib/threads');

const { crypto } = pools;

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client,
			event: 'messageDelete',
		});
	}

	/**
	 * @param {import("discord.js").Message} message
	 */
	async run(message) {
		/** @type {import("client")} */
		const client = this.client;

		if (!message.guild) return;

		const ticket = await client.prisma.ticket.findUnique({
			include: { guild: true },
			where: { id: message.channel.id },
		});
		if (!ticket) return;

		let content = message.cleanContent;

		const logEvent = (await message.guild.fetchAuditLogs({
			limit: 1,
			type: AuditLogEvent.MessageDelete,
		})).entries.first();

		if (ticket.guild.archive) {
			try {
				// Check if message exists in archive before attempting to update
				const archived = await client.prisma.archivedMessage.findUnique({ 
					where: { id: message.id } 
				});
				
				if (archived) {
					await client.prisma.archivedMessage.update({
						data: { deleted: true },
						where: { id: message.id },
					});
					
					if (archived.content && !content) {
						const string = await crypto.queue(w => w.decrypt(archived.content));
						content = JSON.parse(string).content;
					}
				} else {
					// Message wasn't archived (likely a system message) - this is normal
					client.log.debug(`Message ${message.id} not found in archive - likely a system message`);
				}
			} catch (error) {
				client.log.warn('Failed to process deleted message in archive:', message.id);
				client.log.error(error);
			}
		}

		let {
			executor,
			target,
		} = logEvent ?? {};

		executor ||= undefined;
		if (target?.id !== message.author?.id) executor = undefined;

		if (executor) {
			try {
				executor = await message.guild.members.fetch(executor.id);
			} catch (error) {
				client.log.error(error);
			}
		}

		if (message.author.id !== client.user.id && !message.flags.has(MessageFlags.Ephemeral)) {
			await logMessageEvent(this.client, {
				action: 'delete',
				diff: {
					original: { content },
					updated: { content: '' },
				},
				executor,
				target: message,
				ticket,
			});
		}
	}
};
