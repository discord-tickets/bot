const fs = require('fs');
const { path } = require('../../utils/fs');

/**
 * Manages the loading of event listeners
 */
module.exports = class ListenerLoader {
	/**
	 * Create a ListenerLoader instance
	 * @param {Client} client 
	 */
	constructor(client) {
		/** The Discord Client */
		this.client = client;
	}

	load() {
		const files = fs.readdirSync(path('./src/listeners'))
			.filter(file => file.endsWith('.js'));

		for (let file of files) {
			try {
				file = require(`../../listeners/${file}`);
				const listener = new file(this.client);
				let on = listener.once ? 'once' : 'on';
				if (listener.raw)
					this.client.ws[on](listener.event, (...data) => listener.execute(...data));
				else
					this.client[on](listener.event, (...data) => listener.execute(...data));
			} catch (e) {
				this.client.log.warn('An error occurred whilst loading a listener');
				this.client.log.error(e);
			}
		}

	}

};