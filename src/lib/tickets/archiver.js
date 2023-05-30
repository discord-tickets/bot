const Cryptr = require('cryptr');
const { encrypt } = new Cryptr(process.env.ENCRYPTION_KEY);

/**
 * Returns highest (roles.highest) hoisted role, or everyone
 * @param {import("discord.js").GuildMember} member
 * @returns {import("discord.js").Role}
 */
const hoistedRole = member => member.roles.hoist || member.guild.roles.everyone;

module.exports = class TicketArchiver {
	constructor(client) {
		/** @type {import("client")} */
		this.client = client;
	}

	/** Add or update a message
	 * @param {string} ticketId
	 * @param {import("discord.js").Message} message
	 * @param {boolean?} external
	 * @returns {import("@prisma/client").ArchivedMessage|boolean}
	 */
	async saveMessage(ticketId, message, external = false) {
		if (process.env.OVERRIDE_ARCHIVE === 'false') return false;

		if (!message.member) {
			try {
				message.member = await message.guild.members.fetch(message.author.id);
			} catch {
				this.client.log.verbose('Failed to fetch member %s of %s', message.author.id, message.guild.id);
			}
		}

		const channels = message.mentions.channels;
		const members = [...message.mentions.members.values()];
		const roles = [...message.mentions.roles.values()];

		if (message.member) {
			members.push(message.member);
			roles.push(hoistedRole(message.member));
		} else {
			this.client.log.warn('Message member does not exist');
			await this.client.prisma.archivedUser.upsert({
				create: {},
				update: {},
				where: {
					ticketId_userId: {
						ticketId,
						userId: 'default',
					},
				},
			});
		}

		for (const role of roles) {
			const data = {
				colour: role.hexColor.slice(1),
				name: role.name,
				roleId: role.id,
				ticket: { connect: { id: ticketId } },
			};
			await this.client.prisma.archivedRole.upsert({
				create: data,
				update: data,
				where: {
					ticketId_roleId: {
						roleId: role.id,
						ticketId,
					},
				},
			});
		}

		for (const member of members) {
			const data = {
				avatar: member.avatar || member.user.avatar, // TODO: save avatar in user/avatars/
				bot: member.user.bot,
				discriminator: member.user.discriminator,
				displayName: member.displayName ? encrypt(member.displayName) : null,
				roleId: !!member && hoistedRole(member).id,
				ticketId,
				userId: member.user.id,
				username: encrypt(member.user.username),
			};
			await this.client.prisma.archivedUser.upsert({
				create: data,
				update: data,
				where: {
					ticketId_userId: {
						ticketId,
						userId: member.user.id,
					},
				},
			});
		}

		let reference;
		if (message.reference) reference = await message.fetchReference();

		const messageD = {
			author: {
				connect: {
					ticketId_userId: {
						ticketId,
						userId: message.author?.id || 'default',
					},
				},
			},
			content: encrypt(
				JSON.stringify({
					attachments: [...message.attachments.values()],
					components: [...message.components.values()],
					content: message.content,
					embeds: message.embeds.map(embed => ({ ...embed })),
					reference: reference ? reference.id : null,
				}),
			),
			createdAt: message.createdAt,
			edited: !!message.editedAt,
			external,
			id: message.id,
		};

		return await this.client.prisma.ticket.update({
			data: {
				archivedChannels: {
					upsert: channels.map(channel => {
						const data = {
							channelId: channel.id,
							name: channel.name,
						};
						return {
							create: data,
							update: data,
							where: {
								ticketId_channelId: {
									channelId: channel.id,
									ticketId,
								},
							},
						};
					}),
				},
				archivedMessages: {
					upsert: {
						create: messageD,
						update: messageD,
						where: { id: message.id },
					},
				},
			},
			where: { id: ticketId },
		});
	}
};