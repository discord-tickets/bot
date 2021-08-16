const Command = require('../modules/commands/command');
const {
	Message, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			aliases: [
				i18n('commands.help.aliases.command'),
				i18n('commands.help.aliases.commands')
			],
			args: [
				{
					description: i18n('commands.help.args.command.description'),
					example: i18n('commands.help.args.command.example'),
					name: i18n('commands.help.args.command.name'),
					required: false
				}
			],
			description: i18n('commands.help.description'),
			internal: true,
			name: i18n('commands.help.name'),
			process_args: false
		});
	}

	/**
	 * @param {Message} message
	 * @param {string} args
	 * @returns {Promise<void|any>}
	 */
	async execute(message, args) {
		const settings = await this.client.utils.getSettings(message.guild);
		const i18n = this.client.i18n.getLocale(settings.locale);

		const cmd = this.manager.commands.find(command => command.aliases.includes(args.toLowerCase()));

		if (cmd) {
			return await cmd.sendUsage(message.channel, args);
		} else {
			const is_staff = await this.client.utils.isStaff(message.member);
			const commands = this.manager.commands.filter(command => {
				if (command.permissions.length >= 1) return message.member.permissions.has(command.permissions);
				else if (command.staff_only) return is_staff;
				else return true;
			});
			const list = commands.map(command => {
				const description = command.description.length > 50
					? command.description.substring(0, 50) + '...'
					: command.description;
				return `**\`${settings.command_prefix}${command.name}\` ·** ${description}`;
			});
			return await message.channel.send({
				embeds: [new MessageEmbed()
					.setColor(settings.colour)
					.setTitle(i18n('commands.help.response.list.title'))
					.setDescription(i18n('commands.help.response.list.description', { prefix: settings.command_prefix }))
					.addField(i18n('commands.help.response.list.fields.commands'), list.join('\n'))
					.setFooter(settings.footer, message.guild.iconURL())]
			});
		}
	}
};
