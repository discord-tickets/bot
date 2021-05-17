const { MessageEmbed } = require('discord.js');

/**
 * A command
 */
module.exports = class Command {
	/**
	 * 
	 * @typedef CommandArgument
	 * @property {string} name - The argument's name
	 * @property {string} description - The argument's description
	 * @property {string} example - An example value
	 * @property {boolean?} required - Is this arg required? Defaults to `false`
	 */
	/**
	 * Create a new Command
	 * @param {import('../../').Bot} client - The Discord Client
	 * @param {Object} data - Command data
	 * @param {string} data.name - The name of the command (3-32)
	 * @param {string} data.description - The description of the command (1-100)
	 * @param {boolean} [data.staff_only] - Only allow staff to use this command?
	 * @param {string[]} [data.permissions] - Array of permissions needed for a user to use this command
	 * @param {boolean} [data.process_args] - Should the command handler process named arguments?
	 * @param {CommandArgument[]} [data.args] - The command's arguments (see [docs](https://github.com/75lb/command-line-args/blob/master/doc/option-definition.md) if using processed args)
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
		this.aliases = data.aliases ?? [];

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
		this.args = data.args ?? [];

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

	/**
	 * Send a message with the command usage
	 * @param {TextChannel} channel - The channel to send the message to
	 * @param {string} [cmd_name] - The command alias
	 * @returns {Message}
	 */
	async sendUsage(channel, cmd_name) {
		let settings = await channel.guild.settings;
		if (!cmd_name) cmd_name = this.name;

		const prefix = settings.command_prefix;
		const i18n = this.client.i18n.getLocale(settings.locale);

		const addArgs = (embed, arg) => {
			let required = arg.required ? '`❗` ' : '';
			let description = `» ${i18n('cmd_usage.args.description', arg.description)}`;
			if (arg.example) description += `\n» ${i18n('cmd_usage.args.example', arg.example)}`;
			embed.addField(required + arg.name, description);
		};

		let usage,
			example,
			embed;

		if (this.process_args) {
			usage = `${prefix + cmd_name} ${this.args.map(arg => arg.required ? `<${arg.name}>` : `[${arg.name}]`).join(' ')}`;
			example = `${prefix + cmd_name} \n${this.args.map(arg => `--${arg.name} ${arg.example || ''}`).join('\n')}`;
			embed = new MessageEmbed()
				.setColor(settings.error_colour)
				.setTitle(i18n('cmd_usage.title', cmd_name))
				.setDescription(i18n('cmd_usage.named_args') + i18n('cmd_usage.description', usage, example));
		} else {
			usage = `${prefix + cmd_name} ${this.args.map(arg => arg.required ? `<${arg.name}>` : `[${arg.name}]`).join(' ')}`;
			example = `${prefix + cmd_name} ${this.args.map(arg => `${arg.example || ''}`).join(' ')}`;
			embed = new MessageEmbed()
				.setColor(settings.error_colour)
				.setTitle(i18n('cmd_usage.title', cmd_name))
				.setDescription(i18n('cmd_usage.description', usage, example));
		}

		this.args.forEach(arg => addArgs(embed, arg));
		return await channel.send(embed);
		
	}

};