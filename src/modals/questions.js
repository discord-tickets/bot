const { Modal } = require('@eartharoid/dbf');

module.exports = class QuestionsModal extends Modal {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'questions',
		});
	}

	/**
	 *
	 * @param {*} id
	 * @param {import("discord.js").ModalSubmitInteraction} interaction
	 */
	async run(id, interaction) {
		await this.client.tickets.postQuestions({
			...id,
			interaction,
		});
	}
};