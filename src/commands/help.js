const Command = require('../modules/commands/command');
// eslint-disable-next-line no-unused-vars
const { MessageEmbed, Message } = require('discord.js');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			internal: true,
			name: i18n('commands.help.name'),
			description: i18n('commands.help.description'),
			aliases: [
				i18n('commands.help.aliases.command'),
				i18n('commands.help.aliases.commands'),
			],
			process_args: false,
			args: [
				{
					name: i18n('commands.help.args.command.name'),
					description: i18n('commands.help.args.command.description'),
					example: i18n('commands.help.args.command.example'),
					required: false,
				}
			]
		});
	}

	/**
	 * @param {Message} message 
	 * @param {string} args 
	 * @returns {Promise<void|any>}
	 */
	async execute(message, args) {
		const settings = await message.guild.settings;
		const i18n = this.client.i18n.getLocale(settings.locale);

		const cmd = this.manager.commands.find(command => command.aliases.includes(args.toLowerCase()));

		if (cmd) {
			return await cmd.sendUsage(message.channel, args);
		} else {
			const commands = this.manager.commands.filter(async command => {
				if (command.permissions.length >= 1) return !message.member.hasPermission(command.permissions);
				else if (command.staff_only) return await message.member.isStaff();
			});
			const list = commands.map(command => {
				const description = command.description.length > 50
					? command.description.substring(0, 50) + '...'
					: command.description;
				return `**\`${settings.command_prefix}${command.name}\` ·** ${description}`;
			});
			return await message.channel.send(
				new MessageEmbed()
					.setColor(settings.colour)
					.setTitle(i18n('commands.help.response.list.title'))
					.setDescription(i18n('commands.help.response.list.description', {
						prefix: settings.command_prefix,
					}))
					.addField(i18n('commands.help.response.list.fields.commands'), list.join('\n'))
					.setFooter(settings.footer, message.guild.iconURL())
			);
		}
	}
};