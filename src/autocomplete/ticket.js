const { Autocompleter } = require('@eartharoid/dbf');

module.exports = class TicketCompleter extends Autocompleter {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'ticket',
		});
	}

	async run(value, comamnd, interaction) { }
};