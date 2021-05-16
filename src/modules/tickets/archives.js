const { int2hex } = require('../../utils');

/** Manages ticket archiving */
module.exports = class TicketArchives  {
	/**
	 * Create a TicketArchives instance
	 * @param {Client} client
	 */
	constructor(client) {

		/** The Discord Client */
		this.client = client;

		this.encrypt = this.client.cryptr.encrypt;
		this.decrypt = this.client.cryptr.decrypt;

	}

	async addMessage(message) {
		try {
			// await this.client.db.transaction(async t => {
			let t_row = await this.client.db.models.Ticket.findOne({
				where: {
					id: message.channel.id
				},
				/* transaction: t */
			});

			if (t_row) {
				await this.client.db.models.Message.create({
					id: message.id,
					ticket: t_row.id,
					author: message.author.id,
					data: this.encrypt(JSON.stringify({
						content: message.content,
						embeds: message.embeds.map(embed => {
							return { embed };
						}),
						attachments: [...message.attachments.values()]
					})),
					createdAt: new Date(message.createdTimestamp)
				}, /* { transaction: t } */);

				await this.updateEntities(message);
			}
			// });
		} catch (e) {
			this.client.log.warn('Failed to add a message to the ticket archive');
			this.client.log.error(e);
		}
	}

	async updateMessage(message) {
		try {
			// await this.client.db.transaction(async t => {
			let m_row = await this.client.db.models.Message.findOne({
				where: {
					id: message.id
				},
				/* transaction: t */
			});

			if (m_row) {
				m_row.data = this.encrypt(JSON.stringify({
					content: message.content,
					embeds: message.embeds.map(embed => {
						return { embed };
					}),
					attachments: [...message.attachments.values()]
				}));

				if (message.editedTimestamp) {
					m_row.edited = true;
					await this.updateEntities(message);
				}

				await m_row.save(/* { transaction: t } */); // save changes
			}
			// });
		} catch (e) {
			this.client.log.warn('Failed to update message in the ticket archive');
			this.client.log.error(e);
		}
	}

	async deleteMessage(message) {
		try {
			// await this.client.db.transaction(async t => {
			let msg = await this.client.db.models.Message.findOne({
				where: {
					id: message.id
				},
				/* transaction: t */
			});

			if (msg) {
				msg.deleted = true;
				await msg.save(/* { transaction: t } */); // save changes to message row
			}
			// });
		} catch (e) {
			this.client.log.warn('Failed to delete message in ticket archive');
			this.client.log.error(e);
		}
	}

	async updateEntities(message) {
		// message author
		await this.updateMember(message.channel.id, message.member);

		// mentioned members
		message.mentions.members.forEach(async member => {
			await this.updateMember(message.channel.id, member);
		});

		// mentioned channels
		message.mentions.channels.forEach(async channel => {
			await this.updateChannel(message.channel.id, channel);
		});

		// mentioned roles
		message.mentions.roles.forEach(async role => {
			await this.updateRole(message.channel.id, role);
		});
	}

	async updateMember(ticket_id, member) {
		await this.updateRole(ticket_id, member.roles.highest);

		try {
			// await this.client.db.transaction(async t => {
			let u_model_data = {
				user: member.user.id,
				ticket: ticket_id
			};

			let [u_row] = await this.client.db.models.UserEntity.findOrCreate({
				where: u_model_data,
				defaults: {
					...u_model_data,
					role: member.roles.highest.id
				},
				/* transaction: t */
			});

			await u_row.update({
				avatar: member.user.avatar,
				username: this.encrypt(member.user.username),
				discriminator: member.user.discriminator,
				display_name: this.encrypt(member.displayName),
				role: member.roles.highest.id,
				bot: member.user.bot
			}, /* { transaction: t } */);

			return u_row;
			// });
		} catch (e) {
			this.client.log.warn('Failed to update message author entity in ticket archive');
			this.client.log.error(e);
		}
	}

	async updateChannel(ticket_id, channel) {
		try {
			// await this.client.db.transaction(async t => {
			let c_model_data = {
				channel: channel.id,
				ticket: ticket_id
			};
			let [c_row] = await this.client.db.models.ChannelEntity.findOrCreate({
				where: c_model_data,
				defaults: c_model_data,
				/* transaction: t */
			});

			await c_row.update({
				name: this.encrypt(channel.name)
			}, /* { transaction: t } */);

			return c_row;
			// });
		} catch (e) {
			this.client.log.warn('Failed to update mentioned channels entities in ticket archive');
			this.client.log.error(e);
		}
	}

	async updateRole(ticket_id, role) {
		try {
			// await this.client.db.transaction(async t => {
			let r_model_data = {
				role: role.id,
				ticket: ticket_id
			};
			let [r_row] = await this.client.db.models.RoleEntity.findOrCreate({
				where: r_model_data,
				defaults: r_model_data,
				/* transaction: t */
			});

			await r_row.update({
				name: this.encrypt(role.name),
				colour: role.color === 0 ? '7289DA' : int2hex(role.color) // 7289DA = 7506394
			}, /* { transaction: t } */);

			return r_row;
			// });
		} catch (e) {
			this.client.log.warn('Failed to update mentioned roles entities in ticket archive');
			this.client.log.error(e);
		}
	}

};