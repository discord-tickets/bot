module.exports = {
	event: 'messageReactionAdd',
	execute: async (client, r, u) => {
		const guild = r.message.guild;
		if (!guild) return;

		let settings = await guild.settings;
		if (!settings) settings = await guild.createSettings();

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

	}
};