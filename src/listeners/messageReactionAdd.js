const { MessageEmbed } = require('discord.js');

module.exports = {
	event: 'messageReactionAdd',
	execute: async (client, r, u) => {
		if (r.partial) {
			r = await r.fetch();
		}

		if (u.id === client.user.id) return;

		const guild = r.message.guild;
		if (!guild) return;

		let settings = await guild.settings;
		if (!settings) settings = await guild.createSettings();
		const i18n = client.i18n.getLocale(settings.locale);
		
		const channel = r.message.channel;
		const member = await guild.members.fetch(u.id);

		if (settings.blacklist.includes(u.id)) {
			return client.log.info(`Ignoring blacklisted member ${u.tag}`);
		} else {
			settings.blacklist.forEach(element => {
				if (guild.roles.cache.has(element) && member.roles.cache.has(element)) {
					return client.log.info(`Ignoring member ${u.tag} with blacklisted role`);
				}
			});
		}
		
		let t_row = await client.db.models.Ticket.findOne({
			where: {
				id: channel.id
			}
		});

		if (t_row && t_row.opening_message === r.message.id) {
			if (r.emoji.name === '🙌' && await member.isStaff()) {
				// ticket claiming

				await t_row.update({
					claimed_by: member.user.id
				});

				await channel.updateOverwrite(member.user.id, {
					VIEW_CHANNEL: true,
				}, `Ticket claimed by ${member.user.tag}`);

				let cat_row = await client.db.models.Category.findOne({
					where: {
						id: t_row.category
					}
				});

				for (let role of cat_row.roles) {
					await channel.updateOverwrite(role, {
						VIEW_CHANNEL: false,
					}, `Ticket claimed by ${member.user.tag}`);
				}

				client.log.info(`${member.user.tag} has claimed "${channel.name}" in "${guild.name}"`);

				await channel.send(
					new MessageEmbed()
						.setColor(settings.colour)
						.setAuthor(member.user.username, member.user.displayAvatarURL())
						.setTitle(i18n('commands.new.response.claimed.title'))
						.setDescription(i18n('commands.new.response.claimed.description', member.toString()))
						.setFooter(settings.footer, guild.iconURL())
				);
			} else {
				await r.users.remove(u.id);
			}
		}

	}
};