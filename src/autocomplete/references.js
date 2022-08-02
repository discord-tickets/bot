const { Autocompleter } = require('@eartharoid/dbf');

module.exports = class ReferencesCompleter extends Autocompleter {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'references',
		});
	}

	async run(value, comamnd, interaction) { }
};