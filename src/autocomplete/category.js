const { Autocompleter } = require('@eartharoid/dbf');

module.exports = class CategoryCompleter extends Autocompleter {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'category',
		});
	}

	async run(value, comamnd, interaction) { }
};