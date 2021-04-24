module.exports = {
	event: 'guildMemberRemove',
	execute: async (client, member) => {
		let tickets = await client.db.models.Ticket.findAndCountAll({
			where: {
				creator: member.id,
				guild: member.guild.id
			}
		});

		for (let ticket of tickets.rows) {
			await client.tickets.close(ticket.id, null, member.guild.id, 'Member left the guild');
		}

		client.log.info(`Closed ${tickets.count} ticket(s) belonging to ${member.user.tag} who left "${member.guild.name}"`);
	}
};