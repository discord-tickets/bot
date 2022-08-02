const { Button } = require('@eartharoid/dbf');

module.exports = class ClaimButton extends Button {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'claim',
		});
	}

	async run (id, interaction) {}
};