module.exports = {
	event: 'INTERACTION_CREATE',
	raw: true,
	execute: async (client, interaction) => {

		if (interaction.type !== 2) return;

		const cmd = interaction.data.name;

		if (!client.commands.commands.has(cmd))
			return client.log.warn(`Received "${cmd}" command invocation, but the command manager does not have a "${cmd}" command`);

		let data = {
			args: interaction.data.options,
			channel: await client.channels.fetch(interaction.channel_id),
			guild: await client.guilds.fetch(interaction.guild_id),
			token: interaction.token
		};

		data.member = await data.guild.members.fetch(interaction.member.user.id);

		try {
			client.log.commands(`Executing ${cmd} command (invoked by ${data.member.user.username.tag})`);
			client.commands.commands.get(cmd).execute(data);
		} catch (e) {
			client.log.warn(`[COMMANDS] An error occurred whilst executed the ${cmd} command`);
			client.log.error(e);
		}

	}
};