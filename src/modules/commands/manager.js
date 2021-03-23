// eslint-disable-next-line no-unused-vars
const { Collection, Client, Message } = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Command = require('./command');

const fs = require('fs');
const { path } = require('../../utils/fs');

/**
 * Manages the loading and execution of commands
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

		if (data.description.length < 1 || data.description.length > 100)
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
	 * @param {(Interaction|Message)} interaction_or_message - Command interaction or message
	 */
	async handle(interaction_or_message, slash) {
		slash = slash === false ? false : true;
		let cmd_name,
			args = {},
			data = {},
			guild_id,
			channel_id,
			member_id;

		if (slash) {
			cmd_name = interaction_or_message.data.name;

			guild_id = interaction_or_message.guild_id;
			channel_id = interaction_or_message.channel_id;
			member_id = interaction_or_message.member.user.id;

			if (interaction_or_message.data.options)
				interaction_or_message.data.options.forEach(({ name, value }) => args[name] = value);
		} else {
			cmd_name = interaction_or_message.content.match(/^tickets\/(\S+)/mi);
			if (cmd_name) cmd_name = cmd_name[1];

			guild_id = interaction_or_message.guild.id;
			channel_id = interaction_or_message.channel.id;
			member_id = interaction_or_message.author.id;
		}

		if (cmd_name === null || !this.commands.has(cmd_name))
			return this.client.log.warn(`Received "${cmd_name}" command invocation, but the command manager does not have a "${cmd_name}" command registered`);
			
		data.args = args;
		data.guild = await this.client.guilds.fetch(guild_id);
		data.channel = await this.client.channels.fetch(channel_id),
		data.member = await data.guild.members.fetch(member_id);

		let settings = await data.guild.settings;
		if (!settings) settings = await data.guild.createSettings();
		const i18n = this.client.i18n.get(settings.locale);

		const cmd = this.commands.get(cmd_name);

		if (cmd.slash && !slash) {
			this.client.log.commands(`Blocking command execution for the "${cmd_name}" command as it was invoked by a message, not a slash command interaction_or_message.`);
			try {
				data.channel.send(i18n('must_be_slash', cmd_name)); // interaction_or_message.reply
			} catch (err) {
				this.client.log.warn('Failed to reply to blocked command invocation message');
			}
			return;
		}

		const no_perm = cmd.permissions instanceof Array
			&& !data.member.hasPermission(cmd.permissions);
		if (no_perm) {
			let perms = cmd.permissions.map(p => `\`${p}\``).join(', ');
			let msg = i18n('no_perm', perms);
			if (slash) return await cmd.respond(interaction_or_message, msg, true);
			else return await interaction_or_message.channel.send(msg);
		}
			
		try {
			if (slash) await cmd.acknowledge(interaction_or_message, true); // respond to discord
			this.client.log.commands(`Executing "${cmd_name}" command (invoked by ${data.member.user.tag})`);
			await cmd.execute(data, interaction_or_message); // run the command 
		} catch (e) {
			this.client.log.warn(`An error occurred whilst executing the ${cmd_name} command`);
			this.client.log.error(e);
		}

	}

};