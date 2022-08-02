const { Button } = require('@eartharoid/dbf');

module.exports = class CreateButton extends Button {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'create',
		});
	}

	async run(id, interaction) { }
};