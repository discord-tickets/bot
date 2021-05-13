const EventListener = require('../modules/listeners/listener');

const { MessageEmbed } = require('discord.js');
const { footer } = require('../utils/discord');

module.exports = class MessageReactionRemoveEventListener extends EventListener {
	constructor(client) {
		super(client, {
			event: 'messageReactionRemove'
		});
	}

	async execute(r, u) {
		// release (unclaim) ticket
		if (r.partial) {
			try {
				await r.fetch();
			} catch (err) {
				return this.client.log.error(err);
			}
		}

		if (u.partial) {
			try {
				await u.fetch();
			} catch (err) {
				return this.client.log.error(err);
			}
		}

		if (u.id === this.client.user.id) return;

		const guild = r.message.guild;
		if (!guild) return;

		let settings = await guild.settings;
		if (!settings) settings = await guild.createSettings();
		const i18n = this.client.i18n.getLocale(settings.locale);

		const channel = r.message.channel;
		const member = await guild.members.fetch(u.id);

		let t_row = await this.client.db.models.Ticket.findOne({
			where: {
				id: channel.id
			}
		});

		if (t_row && t_row.opening_message === r.message.id) {
			if (r.emoji.name === '🙌' && await member.isStaff()) {
				// ticket claiming

				await t_row.update({
					claimed_by: null
				});

				await channel.permissionOverwrites
					.get(member.user.id)
					.delete(`Ticket released by ${member.user.tag}`);

				let cat_row = await this.client.db.models.Category.findOne({
					where: {
						id: t_row.category
					}
				});

				for (let role of cat_row.roles) {
					await channel.updateOverwrite(role, {
						VIEW_CHANNEL: true,
					}, `Ticket released by ${member.user.tag}`);
				}

				this.client.log.info(`${member.user.tag} has released "${channel.name}" in "${guild.name}"`);

				await channel.send(
					new MessageEmbed()
						.setColor(settings.colour)
						.setAuthor(member.user.username, member.user.displayAvatarURL())
						.setTitle(i18n('commands.new.response.released.title'))
						.setDescription(i18n('commands.new.response.released.description', member.toString()))
						.setFooter(settings.footer, guild.iconURL())
				);
			} else {
				await r.users.remove(u.id);
			}
		}
	}
};
