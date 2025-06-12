const { expose } = require('threads/worker');
const { decrypt } = require('../crypto')

function getTranscript(ticket) {
	ticket.claimedBy = ticket.archivedUsers.find(u => u.userId === ticket.claimedById);
	ticket.closedBy = ticket.archivedUsers.find(u => u.userId === ticket.closedById);
	ticket.createdBy = ticket.archivedUsers.find(u => u.userId === ticket.createdById);

	if (ticket.closedReason) ticket.closedReason = decrypt(ticket.closedReason);
	if (ticket.feedback?.comment) ticket.feedback.comment = decrypt(ticket.feedback.comment);
	if (ticket.topic) ticket.topic = decrypt(ticket.topic).replace(/\n/g, '\n\t');

	ticket.archivedUsers.forEach((user, i) => {
		if (user.displayName) user.displayName = decrypt(user.displayName);
		user.username = decrypt(user.username);
		ticket.archivedUsers[i] = user;
	});

	ticket.archivedMessages.forEach((message, i) => {
		message.author = ticket.archivedUsers.find(u => u.userId === message.authorId);
		message.content = JSON.parse(decrypt(message.content));
		message.text = message.content.content?.replace(/\n/g, '\n\t') ?? '';
		message.content.attachments?.forEach(a => (message.text += '\n\t' + a.url));
		message.content.embeds?.forEach(() => (message.text += '\n\t[embedded content]'));
		message.number = 'M' + String(i + 1).padStart(ticket.archivedMessages.length.toString().length, '0');
		ticket.archivedMessages[i] = message;
	});

	ticket.questionAnswers = ticket.questionAnswers.map(answer => {
		answer.value &&= decrypt(answer.value);
		return answer;
	});

	ticket.pinnedMessageIds = ticket.pinnedMessageIds.map(id => ticket.archivedMessages.find(message => message.id === id)?.number);

	return ticket;
}

expose(getTranscript);


