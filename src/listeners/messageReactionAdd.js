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
		
		let member = await guild.members.fetch(u.id);

		if (settings.blacklist.includes(u.id)) {
			return client.log.info(`Ignoring blacklisted member ${u.tag}`);
		} else {
			let member = await guild.members.fetch(u.id);
			settings.blacklist.forEach(element => {
				if (guild.roles.cache.has(element) && member.roles.cache.has(element)) {
					return client.log.info(`Ignoring member ${u.tag} with blacklisted role`);
				}
			});
		}
		let t_row = await client.db.models.Ticket.findOne({
			where: {
				id: r.message.channel.id
			}
		});
		client.log.info('got t row')
		if (t_row) {
			if (
				t_row.opening_message === r.message.id
				&& r.emoji.name === '🙌'
				&& await member.isStaff()
			) {
				// ticket claiming
				client.log.info('claimed')
			}
		}

	}
};