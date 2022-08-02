const { Autocompleter } = require('@eartharoid/dbf');

module.exports = class TagCompleter extends Autocompleter {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'tag',
		});
	}

	async run(value, comamnd, interaction) { }
};