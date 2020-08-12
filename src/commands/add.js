/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

const Discord = require('discord.js');
const config = require('../../user/config.js');
const ChildLogger = require('leekslazylogger').ChildLogger;
const log = new ChildLogger();

module.exports = {
	name: 'add',
	description: 'Add a member to a ticket channel',
	usage: '<@member> [... #channel]',
	aliases: ['+'],
	example: 'add @member to #ticket-23',
	args: true,
	async execute(client, message, args, Ticket) {

		const notTicket = new Discord.MessageEmbed()
			.setColor(config.err_colour)
			.setAuthor(message.author.username, message.author.displayAvatarURL())
			.setTitle(':x: **This isn\'t a ticket channel**')
			.setDescription('Use this command in the ticket channel you want to add a user to, or mention the channel.')
			.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
			.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
			.setFooter(message.guild.name, message.guild.iconURL());

		let ticket;

		let channel = message.mentions.channels.first();

		if(!channel) {

			channel = message.channel;
			ticket = await Ticket.findOne({ where: { channel: message.channel.id } });
			if(!ticket) 
				return message.channel.send(notTicket);

		} else {
		
			ticket = await Ticket.findOne({ where: { channel: channel.id } });
			if(!ticket) {
				notTicket
					.setTitle(':x: **Channel is not a ticket**')
					.setDescription(`${channel} is not a ticket channel.`);
				return message.channel.send(notTicket);
			}
		}

		if(message.author.id !== ticket.get('creator') && !message.member.roles.cache.has(config.staff_role))
			return message.channel.send(
				new Discord.MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(':x: **No permission**')
					.setDescription(`You don't have permission to alter ${channel} as it does not belong to you and you are not staff.`)
					.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
					.setFooter(message.guild.name, message.guild.iconURL())
			);
		
		

		let member = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
		
		if(!member) 
			return message.channel.send(
				new Discord.MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(':x: **Unknown member**')
					.setDescription('Please mention a valid member.')
					.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
					.setFooter(message.guild.name, message.guild.iconURL())
			);

		try {
			channel.updateOverwrite(member.user, {
				VIEW_CHANNEL: true,
				SEND_MESSAGES: true,
				ATTACH_FILES: true,
				READ_MESSAGE_HISTORY: true
			});

			if(channel.id !== message.channel.id)
				channel.send(
					new Discord.MessageEmbed()
						.setColor(config.colour)
						.setAuthor(member.user.username, member.user.displayAvatarURL())
						.setTitle('**Member added**')
						.setDescription(`${member} has been added by ${message.author}`)
						.setFooter(message.guild.name, message.guild.iconURL())
				);


			
			message.channel.send(
				new Discord.MessageEmbed()
					.setColor(config.colour)
					.setAuthor(member.user.username, member.user.displayAvatarURL())
					.setTitle(':white_check_mark: **Member added**')
					.setDescription(`${member} has been added to <#${ticket.get('channel')}>`)
					.setFooter(message.guild.name, message.guild.iconURL())
			);
			
			log.info(`${message.author.tag} added a user to a ticket (#${message.channel.id})`);
		} catch (error) {
			log.error(error);
		}
		// command ends here
	},
};
