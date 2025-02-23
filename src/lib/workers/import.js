const { expose } = require('threads/worker');
const Cryptr = require('cryptr');
const { encrypt } = new Cryptr(process.env.ENCRYPTION_KEY);

expose({
	importTicket(stringified, guildId, categoryMap) {
		const ticket = JSON.parse(stringified);

		ticket.archivedChannels = {
			create: ticket.archivedChannels.map(user => {
				delete user.ticketId;
				return user;
			}),
		};

		ticket.archivedUsers = {
			create: ticket.archivedUsers.map(user => {
				delete user.ticketId;
				user.displayName &&= encrypt(user.displayName);
				user.username &&= encrypt(user.username);
				return user;
			}),
		};

		ticket.archivedRoles = {
			create: ticket.archivedRoles.map(user => {
				delete user.ticketId;
				return user;
			}),
		};

		const messages = ticket.archivedMessages.map(message => {
			// messages don't need to be wrapped in {create}
			message.content &&= encrypt(message.content);
			return message;
		});
		delete ticket.archivedMessages;

		ticket.category = { connect: { id: categoryMap.get(ticket.categoryId) } };
		delete ticket.categoryId;

		if (ticket.claimedById) {
			ticket.claimedBy = {
				connectOrCreate: {
					create: { id: ticket.claimedById },
					where: { id: ticket.claimedById },
				},
			};
		}
		delete ticket.claimedById;

		if (ticket.closedById) {
			ticket.closedBy = {
				connectOrCreate: {
					create: { id: ticket.closedById },
					where: { id: ticket.closedById },
				},
			};
		}
		delete ticket.closedById;

		if (ticket.createdById) {
			ticket.createdBy = {
				connectOrCreate: {
					create: { id: ticket.createdById },
					where: { id: ticket.createdById },
				},
			};
		}
		delete ticket.createdById;

		ticket.closedReason &&= encrypt(ticket.closedReason);

		if (ticket.feedback) {
			ticket.feedback.guild = { connect: { id: guildId } };
			ticket.feedback.comment &&= encrypt(ticket.feedback.comment);
			if (ticket.feedback.userId) {
				ticket.feedback.user = {
					connectOrCreate: {
						create: { id: ticket.feedback.userId },
						where: { id: ticket.feedback.userId },
					},
				};
				delete ticket.feedback.userId;
			}
			ticket.feedback = { create: ticket.feedback };
		} else {
			ticket.feedback = undefined;
		}

		ticket.guild = { connect: { id: guildId } };
		delete ticket.guildId; // shouldn't exist but make sure

		if (ticket.questionAnswers.length) {
			ticket.questionAnswers = {
				create: ticket.questionAnswers.map(answer => {
					answer.value &&= encrypt(answer.value);
					return answer;
				}),
			};
		} else {
			ticket.questionAnswers = undefined;
		}

		if (ticket.referencesTicketId) {
			ticket.referencesTicket = { connect: { id: ticket.referencesTicketId } };
		}
		delete ticket.referencesTicketId;

		ticket.topic &&= encrypt(ticket.topic);

		return [ticket, messages];

	},
});
