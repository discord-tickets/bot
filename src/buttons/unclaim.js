const { Button } = require('@eartharoid/dbf');

module.exports = class UnclaimButton extends Button {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'unclaim',
		});
	}

	async run(id, interaction) { }
};