/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

const { MessageEmbed } = require('discord.js');
const ChildLogger = require('leekslazylogger').ChildLogger;
const log = new ChildLogger();

module.exports = {
	name: 'remove',
	description: 'Remove a member from ticket channel',
	usage: '<@member> [... #channel]',
	aliases: ['none'],
	example: 'remove @member from #ticket-23',
	args: true,
	async execute(client, message, args, {config, Ticket}) {
		const guild = client.guilds.cache.get(config.guild);

		const notTicket = new MessageEmbed()
			.setColor(config.err_colour)
			.setAuthor(message.author.username, message.author.displayAvatarURL())
			.setTitle(':x: **This isn\'t a ticket channel**')
			.setDescription('Use this command in the ticket channel you want to remove a user from, or mention the channel.')
			.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
			.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
			.setFooter(guild.name, guild.iconURL());

		let ticket;

		let channel = message.mentions.channels.first();

		if (!channel) {

			channel = message.channel;
			ticket = await Ticket.findOne({ where: { channel: message.channel.id } });
			if (!ticket)
				return message.channel.send(notTicket);

		} else {

			ticket = await Ticket.findOne({ where: { channel: channel.id } });
			if (!ticket) {
				notTicket
					.setTitle(':x: **Channel is not a ticket**')
					.setDescription(`${channel} is not a ticket channel.`);
				return message.channel.send(notTicket);
			}
		}

		if (message.author.id !== ticket.creator && !message.member.roles.cache.has(config.staff_role)) {
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(':x: **No permission**')
					.setDescription(`You don't have permission to alter ${channel} as it does not belong to you and you are not staff.`)
					.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
					.setFooter(guild.name, guild.iconURL())
			);
		}

		let member = guild.member(message.mentions.users.first() || guild.members.cache.get(args[0]));

		if (!member || member.id === message.author.id || member.id === guild.me.id)
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(':x: **Unknown member**')
					.setDescription('Please mention a valid member.')
					.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
					.setFooter(guild.name, guild.iconURL())
			);

		try {
			channel.updateOverwrite(member.user, {
				VIEW_CHANNEL: false,
				SEND_MESSAGES: false,
				ATTACH_FILES: false,
				READ_MESSAGE_HISTORY: false
			});

			if (channel.id !== message.channel.id) {
				channel.send(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(member.user.username, member.user.displayAvatarURL())
						.setTitle('**Member removed**')
						.setDescription(`${member} has been removed by ${message.author}`)
						.setFooter(guild.name, guild.iconURL())
				);
			}

			message.channel.send(
				new MessageEmbed()
					.setColor(config.colour)
					.setAuthor(member.user.username, member.user.displayAvatarURL())
					.setTitle(':white_check_mark: **Member removed**')
					.setDescription(`${member} has been removed from <#${ticket.channel}>`)
					.setFooter(guild.name, guild.iconURL())
			);

			log.info(`${message.author.tag} removed a user from a ticket (#${message.channel.id})`);
		} catch (error) {
			log.error(error);
		}
	},
};
