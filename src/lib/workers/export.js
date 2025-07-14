const { expose } = require('threads/worker');
const { decrypt } = require('../crypto');

expose({
	/**
	 * Exports a batch of tickets in a single worker thread
	 * @param batch
	 */
	exportTicketBatch(batch){
		function exportTicket(ticket) {
			ticket.archivedMessages = ticket.archivedMessages.map(message => {
				try {
					message.content &&= decrypt(message.content);
					return message;
				}catch (e) {
					return undefined;
				}
			});

			ticket.archivedUsers = ticket.archivedUsers.map(user => {
				user.displayName &&= decrypt(user.displayName);
				user.username &&= decrypt(user.username);
				return user;
			});

			if (ticket.feedback) {
				// why is feedback the only one with a guild relation? 😕
				delete ticket.feedback.guildId;
				ticket.feedback.comment &&= decrypt(ticket.feedback.comment);
			}

			ticket.closedReason &&= decrypt(ticket.closedReason);

			delete ticket.guildId;

			ticket.questionAnswers = ticket.questionAnswers.map(answer => {
				answer.value &&= decrypt(answer.value);
				return answer;
			});

			ticket.topic &&= decrypt(ticket.topic);

			return JSON.stringify(ticket);
		}

		return batch.map(ticket => {
			try {
				return exportTicket(ticket);
			}catch (err){ /* empty */ }
		})
			.filter(Boolean)
			.join('\n')+ '\n';
	},
});
