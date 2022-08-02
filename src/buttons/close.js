const { Button } = require('@eartharoid/dbf');

module.exports = class CloseButton extends Button {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'close',
		});
	}

	async run(id, interaction) { }
};