const { Modal } = require('@eartharoid/dbf');

module.exports = class TopicModal extends Modal {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'topic',
		});
	}

	async run(id, interaction) {
		console.log(id);
		console.log(require('util').inspect(interaction, {
			colors: true,
			depth: 10,
		}));
	}
};