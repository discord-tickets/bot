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

	}

	async addMessage(message) {
		let t_row = await this.client.db.models.Ticket.findOne({
			where: {
				id: message.channel.id
			}
		});

		if (t_row) {
			await this.client.db.models.Message.create({
				id: message.id,
				ticket: t_row.id,
				author: message.author.id,
				data: {
					content: message.content,
					// time: message.createdTimestamp,
					embeds: message.embeds.map(embed => {
						return { embed };
					}),
					attachments: [...message.attachments.values()]
				}
			});

			this.updateEntities(message);
		}
	}

	async updateMessage(message) {
		let m_row = await this.client.db.models.Message.findOne({
			where: {
				id: message.id
			}
		});

		if (m_row) {
			m_row.data = {
				content: message.content,
				// time: message.editedTimestamp,
				embeds: message.embeds.map(embed => {
					return { embed };
				}),
				attachments: [...message.attachments.values()]
			};

			if (message.editedTimestamp) {
				m_row.edited = true;
				this.updateEntities(message);
			}

			await m_row.save(); // save changes
		}
	}

	async deleteMessage(message) {
		let msg = await this.client.db.models.Message.findOne({
			where: {
				id: message.id
			}
		});

		if (msg) {
			msg.deleted = true;
			await msg.save(); // save changes to message row
		}
	}


	async updateEntities(message) {
		let m_row = await this.client.db.models.Message.findOne({
			where: {
				id: message.id
			}
		});

		if (!m_row) return;

		// message author
		let u_model_data = {
			user: message.author.id,
			ticket: message.channel.id
		};
		let [u_row] = await this.client.db.models.UserEntity.findOrCreate({
			where: u_model_data,
			defaults: u_model_data
		});
		await u_row.update({
			avatar: message.author.displayAvatarURL(),
			username: message.author.username,
			discriminator: message.author.discriminator,
			display_name: message.member.displayName,
			colour: message.member.displayColor === 0 ? null : int2hex(message.member.displayColor),
			bot: message.author.bot
		});

		// mentioned members
		message.mentions.members.forEach(async member => {
			let m_model_data = {
				user: member.user.id,
				ticket: message.channel.id
			};
			let [m_row] = await this.client.db.models.UserEntity.findOrCreate({
				where: m_model_data,
				defaults: m_model_data
			});

			await m_row.update({
				avatar: member.user.displayAvatarURL(),
				username: member.user.username,
				discriminator: member.user.discriminator,
				display_name: member.displayName,
				colour: member.displayColor === 0 ? null : int2hex(member.displayColor),
				bot: member.user.bot
			});
		});

		// mentioned channels
		message.mentions.channels.forEach(async channel => {
			let c_model_data = {
				channel: channel.id,
				ticket: message.channel.id
			};
			let [c_row] = await this.client.db.models.ChannelEntity.findOrCreate({
				where: c_model_data,
				defaults: c_model_data
			});
			await c_row.update({
				name: channel.name
			});
		});

		// mentioned roles
		message.mentions.roles.forEach(async role => {
			let r_model_data = {
				role: role.id,
				ticket: message.channel.id
			};
			let [r_row] = await this.client.db.models.RoleEntity.findOrCreate({
				where: r_model_data,
				defaults: r_model_data
			});
			await r_row.update({
				name: role.name,
				colour: role.color === 0 ? '7289DA' : int2hex(role.color) // 7289DA = 7506394
			});
		});
		
	}


};