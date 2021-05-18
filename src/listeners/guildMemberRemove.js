const EventListener = require('../modules/listeners/listener');

module.exports = class GuildMemberRemoveEventListener extends EventListener {
	constructor(client) {
		super(client, {
			event: 'guildMemberRemove'
		});
	}

	async execute(member) {
		const tickets = await this.client.db.models.Ticket.findAndCountAll({
			where: {
				creator: member.id,
				guild: member.guild.id
			}
		});

		for (const ticket of tickets.rows) {
			await this.client.tickets.close(ticket.id, null, member.guild.id, 'Member left the guild');
		}

		this.client.log.info(`Closed ${tickets.count} ticket(s) belonging to ${member.user.tag} who left "${member.guild.name}"`);
	}
};