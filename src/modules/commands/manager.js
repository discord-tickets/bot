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

		let internal = cmd.internal ? 'internal ' : '';
		this.client.log.commands(`Loaded ${internal}"${cmd.name}" command`);
	}

	/**
	 * Execute a command
	 * @param {Message} message - Command message
	 */
	async handle(message) {
		let settings = await message.guild.settings;
		if (!settings) settings = await message.guild.createSettings();
		
		const prefix = settings.command_prefix;
		const i18n = this.client.i18n.get(settings.locale);

		let cmd_name = message.content.match(new RegExp(`^${prefix}(\\S+)`, 'mi'));
		if (!cmd_name) return;

		let raw_args = message.content.replace(cmd_name[0], '').trim();
		cmd_name = cmd_name[1];

		const cmd = this.commands.find(cmd => cmd.aliases.includes(cmd_name));
		if (!cmd);

		let args = raw_args;
		if (cmd.process_args) {
			args = {};
			let data = [...raw_args.matchAll(/(\w+)\??\s?:\s?(["`'](.*)["`'];|[\w<>@!#]+)/gmi)];
			data.forEach(arg => args[arg[1]] = arg[3] || arg[2]);
		}

		const no_perm = cmd.permissions instanceof Array && !message.member.hasPermission(cmd.permissions);
		if (no_perm) {
			let perms = cmd.permissions.map(p => `\`${p}\``).join(', ');
			return message.channel.send(i18n('no_perm', perms));
		}

		if (cmd.staff_only) {
			let staff_roles = new Set(); // eslint-disable-line no-undef
			let guild_categories = await this.client.db.models.Category.findAll({
				where: {
					guild: message.guild.id
				}
			});
			guild_categories.forEach(cat => {
				cat.roles.forEach(r => staff_roles.add(r));
			});
			staff_roles = staff_roles.filter(r => message.member.roles.cache.has(r));
			const not_staff = staff_roles.length === 0;
			if (not_staff) {
				return message.channel.send(i18n('staff_only'));
			}
		}
			
		try {
			this.client.log.commands(`Executing "${cmd_name}" command (invoked by ${message.author.tag})`);
			await cmd.execute(message, args, raw_args); // execute the command 
		} catch (e) {
			this.client.log.warn(`An error occurred whilst executing the ${cmd_name} command`);
			this.client.log.error(e);
		}
	}

};