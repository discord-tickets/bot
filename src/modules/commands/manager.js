
const {
	Client, // eslint-disable-line no-unused-vars
	Collection,
	Message, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

const fs = require('fs');
const { path } = require('../../utils/fs');

const { parseArgsStringToArgv: argv } = require('string-argv');
const parseArgs = require('command-line-args');

/**
 * Manages the loading and execution of commands
 */
module.exports = class CommandManager {
	/**
	 * Create a CommandManager instance
	 * @param {import('../..').Bot} client
	 */
	constructor(client) {
		/** The Discord Client */
		this.client = client;

		/**
		 * A discord.js Collection (Map) of loaded commands
		 * @type {Collection<string, import('./command')>}
		 */
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
		const is_internal = (exists && cmd.internal) || (exists && this.commands.get(cmd.name).internal);

		if (is_internal) {
			const plugin = this.client.plugins.plugins.find(p => p.commands.includes(cmd.name));
			if (plugin) this.client.log.commands(`The "${plugin.name}" plugin has overridden the internal "${cmd.name}" command`);
			else this.client.log.commands(`An unknown plugin has overridden the internal "${cmd.name}" command`);
			if(cmd.internal) return;
		} else if (exists) {
			throw new Error(`A non-internal command with the name "${cmd.name}" already exists`);
		}

		this.commands.set(cmd.name, cmd);
		this.client.log.commands(`Loaded "${cmd.name}" command`);
	}

	/**
	 * Execute a command
	 * @param {Message} message - Command message
	 */
	async handle(message) {
		if (message.author.bot) return; //  ignore self and other bots

		const settings = await this.client.utils.getSettings(message.guild);
		const i18n = this.client.i18n.getLocale(settings.locale);
		const prefix = settings.command_prefix;
		const escaped_prefix = prefix.toLowerCase().replace(/(?=\W)/g, '\\'); // (lazy) escape every character so it can be used in a RexExp
		const client_mention = `<@!?${this.client.user.id}>`;

		let cmd_name = message.content.match(new RegExp(`^(${escaped_prefix}|${client_mention}\\s?)(\\S+)`, 'mi')); // capture prefix and command
		if (!cmd_name) return; // stop here if the message is not a command

		const raw_args = message.content.replace(cmd_name[0], '').trim(); // remove the prefix and command
		cmd_name = cmd_name[2].toLowerCase(); // set cmd_name to the actual command alias, effectively removing the prefix

		const cmd = this.commands.find(cmd => cmd.aliases.includes(cmd_name));
		if (!cmd) return;

		let is_blacklisted = false;
		if (settings.blacklist.includes(message.author.id)) {
			is_blacklisted = true;
			this.client.log.info(`Ignoring blacklisted member ${message.author.tag}`);
		} else {
			settings.blacklist.forEach(element => {
				if (message.guild.roles.cache.has(element) && message.member.roles.cache.has(element)) {
					is_blacklisted = true;
					this.client.log.info(`Ignoring member ${message.author.tag} with blacklisted role`);
				}
			});
		}

		if (is_blacklisted) {
			try {
				return message.react('❌');
			} catch (error) {
				return this.client.log.warn('Failed to react to a message');
			}
		}

		const bot_permissions = message.guild.me.permissionsIn(message.channel);
		const required_bot_permissions = [
			'ADD_REACTIONS',
			'ATTACH_FILES',
			'EMBED_LINKS',
			'MANAGE_CHANNELS',
			'MANAGE_MESSAGES',
			'READ_MESSAGE_HISTORY',
			'SEND_MESSAGES'
		];

		if (!bot_permissions.has(required_bot_permissions)) {
			const perms = required_bot_permissions.map(p => `\`${p}\``).join(', ');
			if (bot_permissions.has(['EMBED_LINKS', 'SEND_MESSAGES'])) {
				await message.channel.send({
					embeds: [
						new MessageEmbed()
							.setColor('ORANGE')
							.setTitle(i18n('bot.missing_permissions.title'))
							.setDescription(i18n('bot.missing_permissions.description', perms))
					]
				});
			} else if (bot_permissions.has('SEND_MESSAGES')) {
				await message.channel.send('⚠️ ' + i18n('bot.missing_permissions.description', perms));
			} else if (bot_permissions.has('ADD_REACTIONS')) {
				await message.react('⚠️');
			} else {
				this.client.log.warn('Unable to respond to command due to missing permissions');
			}
			return;
		}

		const missing_permissions = cmd.permissions instanceof Array && !message.member.permissions.has(cmd.permissions);
		if (missing_permissions) {
			const perms = cmd.permissions.map(p => `\`${p}\``).join(', ');
			return await message.channel.send({
				embeds: [
					new MessageEmbed()
						.setColor(settings.error_colour)
						.setTitle(i18n('missing_permissions.title'))
						.setDescription(i18n('missing_permissions.description', perms))
				]
			});
		}

		if (cmd.staff_only && await this.client.utils.isStaff(message.member) === false) {
			return await message.channel.send({
				embeds: [
					new MessageEmbed()
						.setColor(settings.error_colour)
						.setTitle(i18n('staff_only.title'))
						.setDescription(i18n('staff_only.description'))
				]
			});
		}

		let args = raw_args;

		if (cmd.process_args) {
			try {
				args = parseArgs(cmd.args, { argv: argv(raw_args) });
			} catch (error) {
				const help_cmd = `${settings.command_prefix}${i18n('commands.help.name')} ${cmd_name}`;
				return await message.channel.send({
					embeds: [
						new MessageEmbed()
							.setColor(settings.error_colour)
							.setTitle(i18n('cmd_usage.invalid_named_args.title'))
							.setDescription(i18n('cmd_usage.invalid_named_args.description', error.message, help_cmd))
					]
				});
			}
			for (const arg of cmd.args) {
				if (arg.required && args[arg.name] === undefined) {
					return await cmd.sendUsage(message.channel, cmd_name); // send usage if any required arg is missing
				}
			}
		} else {
			const args_num = raw_args.split(/\s/g).filter(arg => arg.length !== 0).length; // count the number of single-word args were given
			const required_args = cmd.args.reduce((acc, arg) => arg.required ? acc + 1 : acc, 0); // count how many of the args are required
			if (args_num < required_args) {
				return await cmd.sendUsage(message.channel, cmd_name);
			}
		}

		try {
			this.client.log.commands(`Executing "${cmd.name}" command (invoked by ${message.author.tag})`);
			await cmd.execute(message, args); // execute the command
		} catch (e) {
			this.client.log.warn(`An error occurred whilst executing the ${cmd.name} command`);
			this.client.log.error(e);
			await message.channel.send({
				embeds: [
					new MessageEmbed()
						.setColor('ORANGE')
						.setTitle(i18n('command_execution_error.title'))
						.setDescription(i18n('command_execution_error.description'))
				]
			}); // hopefully no user will ever see this message
		}
	}

};
