const { Modal } = require('@eartharoid/dbf');

module.exports = class TopicModal extends Modal {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'topic',
		});
	}

	async run(id, interaction) {
		await this.client.tickets.postQuestions({
			...id,
			interaction,
		});
	}
};