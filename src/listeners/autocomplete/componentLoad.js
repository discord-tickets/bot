const { Listener } = require('@eartharoid/dbf');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client.autocomplete,
			event: 'componentLoad',
		});
	}

	run(autocompleter) {
		this.client.log.info.autocomplete(`Loaded "${autocompleter.id}" autocompleter`);
		return true;
	}
};
