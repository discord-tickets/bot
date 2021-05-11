const Command = require('../modules/commands/command');
const { MessageEmbed } = require('discord.js');

module.exports = class BlacklistCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			internal: true,
			name: i18n('commands.blacklist.name'),
			description: i18n('commands.blacklist.description'),
			aliases: [
				i18n('commands.blacklist.aliases.unblacklist'),
			],
			permissions: ['MANAGE_GUILD'], // staff_only: true,
			process_args: false,
			args: [
				{
					name: i18n('commands.blacklist.args.member_or_role.name'),
					description: i18n('commands.blacklist.args.member_or_role.description'),
					example: i18n('commands.blacklist.args.member_or_role.example'),
					required: false,
				}
			]
		});
	}

	async execute(message, args) {
		let settings = await message.guild.settings;
		const i18n = this.client.i18n.getLocale(settings.locale);

		let member = message.mentions.members.first();

		if (member && (await member.isStaff() || member.hasPermission(this.permissions))) {
			return await message.channel.send(
				new MessageEmbed()
					.setColor(settings.colour)
					.setTitle(i18n('commands.blacklist.response.illegal_action.title'))
					.setDescription(i18n('commands.blacklist.response.illegal_action.description', `<@${member.id}>`))
					.setFooter(settings.footer, message.guild.iconURL())
			);
		}
		
		
		let role = message.mentions.roles.first();
		let id;
		let input = args.trim().split(/\s/g)[0];

		if (member) id = member.id;
		else if (role) id = role.id;
		else if (/\d{17,19}/.test(input)) id = input;
		else if (settings.blacklist.length === 0) {
			return await message.channel.send(
				new MessageEmbed()
					.setColor(settings.colour)
					.setTitle(i18n('commands.blacklist.response.empty_list.title'))
					.setDescription(i18n('commands.blacklist.response.empty_list.description', settings.command_prefix))
					.setFooter(settings.footer, message.guild.iconURL())
			);
		} else {
			// list blacklisted members
			let blacklist = settings.blacklist.map(element => {
				const is_role = message.guild.roles.cache.has(element);
				if (is_role) return `» <@&${element}> (\`${element}\`)`;
				else return `» <@${element}> (\`${element}\`)`;
			});
			return await message.channel.send(
				new MessageEmbed()
					.setColor(settings.colour)
					.setTitle(i18n('commands.blacklist.response.list.title'))
					.setDescription(blacklist.join('\n'))
					.setFooter(settings.footer, message.guild.iconURL())
			);
		}

		const is_role = role !== undefined || message.guild.roles.cache.has(id);
		let member_or_role = is_role ? 'role' : 'member';
		let index = settings.blacklist.findIndex(element => element === id);

		let new_blacklist = [ ...settings.blacklist];

		if (index === -1) {
			new_blacklist.push(id);
			await message.channel.send(
				new MessageEmbed()
					.setColor(settings.colour)
					.setTitle(i18n(`commands.blacklist.response.${member_or_role}_added.title`))
					.setDescription(i18n(`commands.blacklist.response.${member_or_role}_added.description`, id))
					.setFooter(settings.footer, message.guild.iconURL())
			);
		} else {
			new_blacklist.splice(index, 1);
			await message.channel.send(
				new MessageEmbed()
					.setColor(settings.colour)
					.setTitle(i18n(`commands.blacklist.response.${member_or_role}_removed.title`))
					.setDescription(i18n(`commands.blacklist.response.${member_or_role}_removed.description`, id))
					.setFooter(settings.footer, message.guild.iconURL())
			);
		}

		settings.blacklist = new_blacklist;
		await settings.save();
	}
};