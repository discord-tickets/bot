/**
 * A command
 */
module.exports = class Command {
	/**
	 * Create a new Command
	 * @param {Client} client - The Discord Client
	 * @param {Object} data - Command data
	 * @param {string} data.name - The name of the command (3-32)
	 * @param {string} data.description - The description of the command (1-100)
	 * @param {boolean} [data.staff_only] - Only allow staff to use this command?
	 * @param {string[]} [data.permissions] - Array of permissions needed for a user to use this command
	 * @param {boolean} [data.process_args] - Should the command handler process named arguments?
	 * @param {CommandArgument[]} [data.args] - The command's arguments
	 */
	constructor(client, data) {

		/** The Discord Client */
		this.client = client;

		/** The CommandManager */
		this.manager = this.client.commands;

		if (typeof data !== 'object') {
			throw new TypeError(`Expected type of command "data" to be an object, got "${typeof data}"`);
		}

		/**
		 * The name of the command 
		 * @type {string}
		 */
		this.name = data.name;

		/**
		 * The command's aliases
		 * @type {string[]}
		 */
		this.aliases = data.aliases || [];

		if (!this.aliases.includes(this.name)) this.aliases.unshift(this.name);

		/**
		 * The command description
		 * @type {string}
		*/
		this.description = data.description;

		/**
		 * Only allow staff to use this command?
		 * @type {boolean}
		 * @default false
		 */
		this.staff_only = data.staff_only === true ? true : false;

		/**
		 * Array of permissions needed for a user to use this command
		 * @type {string[]}
		*/
		this.permissions = data.permissions;

		/**
		 * Should the command handler process named arguments?
		 * @type {boolean}
		 * @default false
		 */
		this.process_args = data.process_args === true ? true : false;

		/** 
		 * The command options
		 * @type {CommandArgument[]}
		 */
		this.args = data.args;

		for (let arg in this.args) {
			if (!this.args[arg].example)
				throw new Error(`The "${this.name}" command's "${this.args[arg].name}" argument does not have an example!`);
		}

		/**
		 * True if command is internal, false if it is from a plugin
		 * @type {boolean}
		 */
		this.internal = data.internal === true ? true : false;

		if (!this.internal) {
			/**
			 * The plugin this command belongs to, if any
			 * @type {(undefined|Plugin)}
			 */
			this.plugin = this.client.plugins.plugins.find(p => p.commands?.includes(this.name));
		}

		try {
			this.manager.register(this); // register the command
		} catch (e) {
			return this.client.log.error(e);
		}


	}

	/**
	 * The code to be executed when a command is invoked
	 * @abstract
	 * @param {Message} message - The message that invoked this command
	 * @param {(object|string)} [args] - Named command arguments, or the message content with the prefix and command removed
	 */
	async execute(message, args) { } // eslint-disable-line no-unused-vars

};