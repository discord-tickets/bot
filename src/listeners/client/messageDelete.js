const { Listener } = require('@eartharoid/dbf');
const { AuditLogEvent } = require('discord.js');
const { logMessageEvent } = require('../../lib/logging');
const { quick } = require('../../lib/threads');

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
				await client.prisma.archivedMessage.update({
					data: { deleted: true },
					where: { id: message.id },
				});
				const archived = await client.prisma.archivedMessage.findUnique({ where: { id: message.id } });
				if (archived?.content) {
					if (!content) {
						const string = await quick('crypto', worker => worker.decrypt(archived.content));
						content = JSON.parse(string).content; // won't be cleaned
					}
				}
			} catch (error) {
				if ((error.meta?.cause || error.cause) === 'Record to update not found.') {
					client.log.warn(`Archived message ${message.id} can't be marked as deleted because it doesn't exist`);
				} else {
					client.log.warn('Failed to "delete" archived message', message.id);
					client.log.error(error);
				}
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

		if (message.author.id !== client.user.id && !message.flags.has('Ephemeral')) {
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
