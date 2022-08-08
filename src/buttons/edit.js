const { Button } = require('@eartharoid/dbf');

module.exports = class EditButton extends Button {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'edit',
		});
	}

	async run(id, interaction) { }
};