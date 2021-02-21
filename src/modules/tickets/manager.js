const EventEmitter = require('events');
// eslint-disable-next-line no-unused-vars
const { Client } = require('discord.js');

/** Manages tickets */
module.exports = class extends EventEmitter {
	/**
	 * Create a TicketManager instance
 	 * @param {Client} client
	 */
	constructor(client) {
		super();

		/** The Discord Client */
		this.client = client;

		this.setMaxListeners(this.client.config.max_listeners);
	}

	/**
	 * Create a new ticket
	 */
	async create() {

	}
};