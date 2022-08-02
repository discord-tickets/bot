const { Modal } = require('@eartharoid/dbf');

module.exports = class FeedbackModal extends Modal {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'feedback',
		});
	}

	async run(id, interaction) { }
};