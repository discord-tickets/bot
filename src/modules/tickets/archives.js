const { int2hex } = require('../../utils');

/** Manages ticket archiving */
module.exports = class TicketArchives  {
	/**
	 * Create a TicketArchives instance
	 * @param {import('../..').Bot} client
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
			const t_row = await this.client.db.models.Ticket.findOne({
				where: { id: message.channel.id }
				/* transaction: t */
			});

			if (t_row) {
				await this.client.db.models.Message.create({
					author: message.author.id,
					createdAt: new Date(message.createdTimestamp),
					data: this.encrypt(JSON.stringify({
						attachments: [...message.attachments.values()],
						content: message.content,
						embeds: message.embeds.map(embed => ({ embed }))
					})),
					id: message.id,
					ticket: t_row.id
				} /* { transaction: t } */);

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
			const m_row = await this.client.db.models.Message.findOne({
				where: { id: message.id }
				/* transaction: t */
			});

			if (m_row) {
				m_row.data = this.encrypt(JSON.stringify({
					attachments: [...message.attachments.values()],
					content: message.content,
					embeds: message.embeds.map(embed => ({ embed }))
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
			const msg = await this.client.db.models.Message.findOne({
				where: { id: message.id }
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
			const u_model_data = {
				ticket: ticket_id,
				user: member.user.id
			};

			const [u_row] = await this.client.db.models.UserEntity.findOrCreate({
				defaults: {
					...u_model_data,
					role: member.roles.highest.id
				},
				where: u_model_data
				/* transaction: t */
			});

			await u_row.update({
				avatar: member.user.avatar,
				bot: member.user.bot,
				discriminator: member.user.discriminator,
				display_name: this.encrypt(member.displayName),
				role: member.roles.highest.id,
				username: this.encrypt(member.user.username)
			} /* { transaction: t } */);

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
			const c_model_data = {
				channel: channel.id,
				ticket: ticket_id
			};
			const [c_row] = await this.client.db.models.ChannelEntity.findOrCreate({
				defaults: c_model_data,
				where: c_model_data
				/* transaction: t */
			});

			await c_row.update({ name: this.encrypt(channel.name) } /* { transaction: t } */);

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
			const r_model_data = {
				role: role.id,
				ticket: ticket_id
			};
			const [r_row] = await this.client.db.models.RoleEntity.findOrCreate({
				defaults: r_model_data,
				where: r_model_data
				/* transaction: t */
			});

			await r_row.update({
				colour: role.color === 0 ? '7289DA' : int2hex(role.color), // 7289DA = 7506394
				name: this.encrypt(role.name)
			} /* { transaction: t } */);

			return r_row;
			// });
		} catch (e) {
			this.client.log.warn('Failed to update mentioned roles entities in ticket archive');
			this.client.log.error(e);
		}
	}

};