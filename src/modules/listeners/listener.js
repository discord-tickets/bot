module.exports = class EventListener {

	constructor(client, data) {
		this.client = client;
		this.event = data.event;
		this.raw = data.raw || false;
		this.once = data.once || false;
	}

};