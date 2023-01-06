const EventListener = require('../modules/listeners/listener');

module.exports = class ChannelDeleteEventListener extends EventListener {
	constructor(client) {
		super(client, { event: 'channelDelete' });
	}

	async execute(channel) {
		if (!channel.guild || channel.type !== 'GUILD_TEXT') return;

		// resolve ticket by id
		const t_row = await this.client.tickets.resolve(channel.id, channel.guild.id);
		if (!t_row) return;

		// fetch user from audit logs
		const logEntry = (await channel.guild.fetchAuditLogs({ type: 'CHANNEL_DELETE' })).entries.find(entry =>
			entry.target.id === channel.id
		);
		if (logEntry.executor.id === this.client.user.id) return;

		await this.client.tickets.close(t_row.id, logEntry?.executor?.id || null, channel.guild.id, 'Channel was deleted');
	}
};