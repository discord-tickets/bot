const EventListener = require('../modules/listeners/listener');

module.exports = class ErrorEventListener extends EventListener {
	constructor(client) {
		super(client, {
			event: 'error'
		});
	}

	async execute(error) {
		this.client.log.warn('The client encountered an error');
		this.client.log.error(error);
	}
};