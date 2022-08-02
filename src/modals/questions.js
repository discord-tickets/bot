const { Modal } = require('@eartharoid/dbf');

module.exports = class QuestionsModal extends Modal {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'questions',
		});
	}

	async run(id, interaction) { }
};