/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

const ChildLogger = require('leekslazylogger').ChildLogger;
const log = new ChildLogger();
const Discord = require('discord.js');
const config = require('../../user/config');

module.exports = {
	name: 'close',
	description: 'Close a ticket; either a specified (mentioned) channel, or the channel the command is used in.',
	usage: '[ticket]',
	aliases: ['none'],
	example: 'close #ticket-17',
	args: false,
	async execute(client, message, args, Ticket) {
		
		const notTicket = new Discord.MessageEmbed()
			.setColor(config.err_colour)
			.setAuthor(message.author.username, message.author.displayAvatarURL())
			.setTitle(':x: **This isn\'t a ticket channel**')
			.setDescription('Use this command in the ticket channel you want to close, or mention the channel.')
			.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
			.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
			.setFooter(message.guild.name, message.guild.iconURL());
		
		let ticket;
		const channel = message.mentions.channels.first();
		// let channel = message.guild.channels.resolve(message.mentions.channels.first()); //  not necessary

		if(!channel) {

			ticket = await Ticket.findOne({ where: { channel: message.channel.id } });
			if(!ticket) 
				return message.channel.send(notTicket);

			ticket.update({ open: false}, { where: { channel: message.channel.id } });

			message.channel.send(
				new Discord.MessageEmbed()
					.setColor(config.colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(`:white_check_mark: **Ticket ${ticket.id} closed**`)
					.setDescription('The channel will be automatically deleted once the contents have been archived.')
					.setFooter(message.guild.name, message.guild.iconURL())
			);

			setTimeout(() => message.channel.delete(), 5000);

		} else {

			ticket = await Ticket.findOne({ where: { channel: channel.id } });
			if(!ticket) {
				notTicket
					.setTitle(':x: **Channel is not a ticket**')
					.setDescription(`${channel} is not a ticket channel.`);
				return message.channel.send(notTicket);
			}

			if(message.author.id !== ticket.get('creator') && !message.member.roles.cache.has(config.staff_role))
				return message.channel.send(
					new Discord.MessageEmbed()
						.setColor(config.err_colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle(':x: **No permission**')
						.setDescription(`You don't have permission to close ${channel} as it does not belong to you and you are not staff.`)
						.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
						.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
						.setFooter(message.guild.name, message.guild.iconURL())
				);

			ticket.update({ open: false}, { where: { channel: channel.id } });

			message.channel.send(
				new Discord.MessageEmbed()
					.setColor(config.colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(`:white_check_mark: **Ticket ${ticket.id} closed**`)
					.setDescription('The channel will be automatically deleted once the contents have been archived.')
					.setFooter(message.guild.name, message.guild.iconURL())
			);

			setTimeout(() => channel.delete(), 5000);
		}

		log.info(`${message.author.tag} closed a ticket (#ticket-${ticket.get('id')})`);
		
		if (config.logs.discord.enabled)
			client.channels.cache.get(config.logs.discord.channel).send(
				new Discord.MessageEmbed()
					.setColor(config.colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('Ticket closed')
					.addField('Creator', `<@${ticket.get('creator')}>` , true)
					.addField('Closed by', message.author, true)
					.setFooter(client.user.username, client.user.avatarURL())
					.setTimestamp()
			);
		
	},
};
