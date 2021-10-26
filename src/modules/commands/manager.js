
const {
	Client, // eslint-disable-line no-unused-vars
	Collection,
	Interaction, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

const fs = require('fs');
const { path } = require('../../utils/fs');

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
	register(command) {
		const exists = this.commands.has(command.name);
		const is_internal = (exists && command.internal) || (exists && this.commands.get(command.name).internal);

		if (is_internal) {
			const plugin = this.client.plugins.plugins.find(p => p.commands.includes(command.name));
			if (plugin) this.client.log.commands(`The "${plugin.name}" plugin has overridden the internal "${command.name}" command`);
			else this.client.log.commands(`An unknown plugin has overridden the internal "${command.name}" command`);
			if(command.internal) return;
		} else if (exists) {
			throw new Error(`A non-internal command with the name "${command.name}" already exists`);
		}

		this.commands.set(command.name, command);
		this.client.log.commands(`Loaded "${command.name}" command`);
	}

	async publish(guild) {
		if (!guild) {
			return this.client.guilds.cache.forEach(guild => {
				this.publish(guild);
			});
		}

		try {
			const commands = await Promise.all(this.client.commands.commands.map(async command => await command.build(guild)));
			await this.client.application.commands.set(commands, guild.id);
			await this.updatePermissions(guild);
			this.client.log.success(`Published ${this.client.commands.commands.size} commands to "${guild.name}"`);
		} catch (error) {
			this.client.log.warn('An error occurred whilst publishing the commands');
			this.client.log.error(error);
		}
	}

	async updatePermissions(guild) {
		guild.commands.fetch().then(async commands => {
			const permissions = [];
			const settings = await this.client.utils.getSettings(guild.id);
			const blacklist = [];
			settings.blacklist.users?.forEach(userId => {
				blacklist.push({
					id: userId,
					permission: false,
					type: 'USER'
				});
			});
			settings.blacklist.roles?.forEach(roleId => {
				blacklist.push({
					id: roleId,
					permission: false,
					type: 'ROLE'
				});
			});

			const categories = await this.client.db.models.Category.findAll({ where: { guild: guild.id } });
			const staff_roles = new Set(categories.map(category => category.roles).flat());

			commands.forEach(async g_cmd => {
				const cmd_permissions = [...blacklist];
				const command = this.client.commands.commands.get(g_cmd.name);

				if (command.staff_only) {
					cmd_permissions.push({
						id: guild.roles.everyone.id,
						permission: false,
						type: 'ROLE'
					});
					staff_roles.forEach(roleId => {
						cmd_permissions.push({
							id: roleId,
							permission: true,
							type: 'ROLE'
						});
					});
				}

				permissions.push({
					id: g_cmd.id,
					permissions: cmd_permissions
				});
			});

			this.client.log.debug(`Command permissions for "${guild.name}"`, require('util').inspect(permissions, {
				colors: true,
				depth: 10
			}));

			try {
				await guild.commands.permissions.set({ fullPermissions: permissions });
			} catch (error) {
				this.client.log.warn('An error occurred whilst updating command permissions');
				this.client.log.error(error);
			}
		});
	}

	/**
	 * Execute a command
	 * @param {Interaction} interaction - Command message
	 */
	async handle(interaction) {
		if (!interaction.guild) return this.client.log.debug('Ignoring non-guild command interaction');
		await interaction.deferReply();
		const settings = await this.client.utils.getSettings(interaction.guild.id);
		const i18n = this.client.i18n.getLocale(settings.locale);

		const command = this.commands.get(interaction.commandName);
		if (!command) return;

		const bot_permissions = interaction.guild.me.permissionsIn(interaction.channel);
		const required_bot_permissions = [
			'ATTACH_FILES',
			'EMBED_LINKS',
			'MANAGE_CHANNELS',
			'MANAGE_MESSAGES'
		];

		if (!bot_permissions.has(required_bot_permissions)) {
			const perms = required_bot_permissions.map(p => `\`${p}\``).join(', ');
			if (bot_permissions.has('EMBED_LINKS')) {
				await interaction.editReply({
					embeds: [
						new MessageEmbed()
							.setColor('ORANGE')
							.setTitle(i18n('bot.missing_permissions.title'))
							.setDescription(i18n('bot.missing_permissions.description', perms))
					]
				});
			} else {
				await interaction.editReply({ content: i18n('bot.missing_permissions.description', perms) });
			}
			return;
		}

		const missing_permissions = command.permissions instanceof Array && !interaction.member.permissions.has(command.permissions);
		if (missing_permissions) {
			const perms = command.permissions.map(p => `\`${p}\``).join(', ');
			return await interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.error_colour)
						.setTitle(i18n('missing_permissions.title'))
						.setDescription(i18n('missing_permissions.description', perms))
				],
				ephemeral: true
			});
		}

		try {
			this.client.log.commands(`Executing "${command.name}" command (invoked by ${interaction.user.tag})`);
			await command.execute(interaction); // execute the command
		} catch (e) {
			this.client.log.warn(`An error occurred whilst executing the ${command.name} command`);
			this.client.log.error(e);
			await interaction.editReply({
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
