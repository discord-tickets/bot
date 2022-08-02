const { Menu } = require('@eartharoid/dbf');

module.exports = class CreateMenu extends Menu {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'create',
		});
	}

	async run(id, interaction) { }
};