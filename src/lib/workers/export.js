const { expose } = require('threads/worker');
const Cryptr = require('cryptr');
const { decrypt } = new Cryptr(process.env.ENCRYPTION_KEY);

function decryptIfExists(encrypted) {
	if (encrypted) return decrypt(encrypted);
	return null;
}

expose({
	exportTicket(ticket) {
		if (ticket.closedReason) ticket.closedReason = decrypt(ticket.closedReason);
		if (ticket.feedback?.comment) ticket.feedback.comment = decrypt(ticket.feedback.comment);
		if (ticket.topic) ticket.topic = decrypt(ticket.topic);

		ticket.archivedMessages = ticket.archivedMessages.map(async message => {
			message.content = decryptIfExists(message.content);
			return message;
		});

		ticket.archivedUsers = ticket.archivedUsers.map(async user => {
			user.displayName = decryptIfExists(user.displayName);
			user.username = decryptIfExists(user.username);
			return user;
		});

		ticket.questionAnswers = ticket.questionAnswers.map(async answer => {
			if (answer.value) answer.value = decryptIfExists(answer.value);
			return answer;
		});

		delete ticket.guildId;

		return JSON.stringify(ticket);
	},
});
