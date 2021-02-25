/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'transfer',
	description: 'Transfer ownership of a ticket channel',
	usage: '<@member>',
	aliases: ['none'],
	example: 'transfer @user',
	args: true,
	async execute(client, message, args, _log, { config, Ticket }) {
		const guild = client.guilds.cache.get(config.guild);

		let ticket = await Ticket.findOne({
			where: {
				channel: message.channel.id
			}
		});

		if (!ticket) {
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **This isn\'t a ticket channel**')
					.setDescription('Use this command in the ticket channel you want to change owner.')
					.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
					.setFooter(guild.name, guild.iconURL())
			);
		}

		if (!message.member.roles.cache.has(config.staff_role))
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **No permission**')
					.setDescription('You don\'t have permission to change ownership of this channel as you are not staff.')
					.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
					.setFooter(guild.name, guild.iconURL())
			);

		let member = guild.member(message.mentions.users.first() || guild.members.cache.get(args[0]));

		if (!member) {
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **Unknown member**')
					.setDescription('Please mention a valid member.')
					.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
					.setFooter(guild.name, guild.iconURL())
			);
		}


		message.channel.setTopic(`${member} | ${ticket.topic}`);

		Ticket.update({
			creator: member.user.id
		}, {
			where: {
				channel: message.channel.id
			}
		});

		message.channel.send(
			new MessageEmbed()
				.setColor(config.colour)
				.setAuthor(message.author.username, message.author.displayAvatarURL())
				.setTitle('✅ **Ticket transferred**')
				.setDescription(`Ownership of this ticket has been transferred to ${member}.`)
				.setFooter(client.user.username, client.user.displayAvatarURL())
		);
	}
};
