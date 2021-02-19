// eslint-disable-next-line no-unused-vars
const { Collection, Client } = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Command = require('./command');

const fs = require('fs');
const { path } = require('../../utils/fs');

/**
 * Manages the loading of commands
 */
module.exports = class CommandManager {
	/**
	 * Create a CommandManager instance
	 * @param {Client} client 
	 */
	constructor(client) {
		/** The Discord Client */
		this.client = client;

		/** A discord.js Collection (Map) of loaded commands */
		this.commands = new Collection();
	}

	/** Automatically load all internal commands */
	load() {
		const files = fs.readdirSync(path('./src/commands'))
			.filter(file => file.endsWith('.js'));

		for (let file of files) {
			try {
				file = require(`../../commands/${file}`);
				new file(this.client);
			} catch (e) {
				this.client.log.warn('An error occurred whilst loading an internal command');
				this.client.log.error(e);
			}
		}
	}

	/** Register a command */
	register(cmd) {
		const exists = this.commands.has(cmd.name);
		const is_internal = (exists && cmd.internal)
			|| (exists && this.commands.get(cmd.name).internal);

		if (is_internal) {
			let plugin = this.client.plugins.plugins.find(p => p.commands.includes(cmd.name));
			if (plugin)
				this.client.log.commands(`The "${plugin.name}" plugin has overridden the internal "${cmd.name}" command`);
			else
				this.client.log.commands(`An unknown plugin has overridden the internal "${cmd.name}" command`);	
			if(cmd.internal) return;
		}
		else if (exists)
			throw new Error(`A non-internal command with the name "${cmd.name}" already exists`);
		
		this.commands.set(cmd.name, cmd);
	}

	/** Check the command data */
	check(data) {

		if (typeof data.name !== 'string')
			throw new TypeError(`Expected type of command name to be a string, got ${typeof data.name}`);

		if (data.name.length < 3 || data.name.length > 32)
			throw new TypeError('Length of command name must be 3-32');

		if (typeof data.description !== 'string')
			throw new TypeError(`Expected type of command description to be a string, got ${typeof data.description}`);

		if (data.name.length < 1 || data.name.length > 100)
			throw new TypeError('Length of description must be 3-32');

		if (typeof data.options !== 'undefined' && !(data.options instanceof Array))
			throw new TypeError(`Expected type of command options to be undefined or an array, got ${typeof data.options}`);

		if (data.options)
			this.checkOptions(data.options);

	}

	/** Check the command data's options */
	checkOptions(options) {
		let num = 0;
		options.forEach(o => {
			if (typeof o.type !== 'number')
				throw new TypeError(`Expected type of option ${num} type to be a number, got ${typeof o.type}`);

			if (typeof o.name !== 'string')
				throw new TypeError(`Expected type of option ${num} name to be a string, got ${typeof o.name}`);

			if (o.name.length < 3 || o.name.length > 32)
				throw new TypeError(`Length of option ${num} name must be 3-32`);

			if (typeof o.description !== 'string')
				throw new TypeError(`Expected type of option ${num} description to be a string, got ${typeof o.description}`);

			if (o.description.length < 1 || o.description.length > 100)
				throw new TypeError(`Length of option ${num} description must be 1-100`);

			if (typeof o.required !== 'undefined' && typeof o.required !== 'boolean')
				throw new TypeError(`Expected type of option ${num} required to be undefined or a boolean, got ${typeof o.required}`);

			if (typeof o.choices !== 'undefined' && !(o.choices instanceof Array))
				throw new TypeError(`Expected type of option ${num} choices to be undefined or an array, got ${typeof o.choices}`);
			
			if (o.choices)
				this.checkOptionChoices(o.choices);

			if (typeof o.options !== 'undefined' && !(o.options instanceof Array))
				throw new TypeError(`Expected type of option ${num} options to be undefined or an array, got ${typeof o.options}`);

			if (o.options)
				this.checkOptions(o.options);

			num++;
		});

	}

	/** Check command option choices */
	checkOptionChoices(choices) {
		let num = 0;
		choices.forEach(c => {
			if (typeof c.name !== 'string')
				throw new TypeError(`Expected type of option choice ${num} name to be a string, got ${typeof c.name}`);
			
			if (c.name.length < 1 || c.name.length > 100)
				throw new TypeError(`Length of option choice ${num} name must be 1-100`);
			
			if (typeof c.value !== 'string' && typeof c.value !== 'number')
				throw new TypeError(`Expected type of option choice ${num} value to be a string or number, got ${typeof c.value}`);

			num++;
		});
	}

	/**
	 * Execute a command
	 * @param {string} cmd_name - Name of the command
	 * @param {interaction} interaction - Command interaction
	 */
	async execute(cmd_name, interaction) {
		if (!this.commands.has(cmd_name))
			throw new Error(`Received "${cmd_name}" command invocation, but the command manager does not have a "${cmd_name}" command`);
		
		let args = {};
		if (interaction.data.options)
			interaction.data.options.forEach(({ name, value }) => args[name] = value);
			
		let data = { args };
		data.guild = await this.client.guilds.fetch(interaction.guild_id);
		data.channel = await this.client.channels.fetch(interaction.channel_id),
		data.member = await data.guild.members.fetch(interaction.member.user.id);

		const cmd = this.commands.get(cmd_name);

		// if (cmd.staff_only) {
		// 	return await cmd.sendResponse(interaction, msg, true);
		// }

		const no_perm = cmd.permissions instanceof Array
			&& !data.member.hasPermission(cmd.permissions);
		if (no_perm) {
			let perms = cmd.permissions.map(p => `\`${p}\``).join(', ');
			let msg = `❌ You do not have the permissions required to use this command:\n${perms}`;
			return await cmd.sendResponse(interaction, msg, true);
		}
			
		try {
			await cmd.deferResponse(interaction, true);
			this.client.log.commands(`Executing "${cmd_name}" command (invoked by ${data.member.user.tag})`);
			let res = await cmd.execute(data, interaction); // run the command 
			if (typeof res === 'object' || typeof res === 'string')
				cmd.sendResponse(interaction, res, res.secret);
		} catch (e) {
			this.client.log.warn(`[COMMANDS] An error occurred whilst executed the ${cmd} command`);
			this.client.log.error(e);
		}

	}

};