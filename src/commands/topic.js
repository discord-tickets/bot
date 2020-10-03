/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'topic',
	description: 'Edit a ticket topic',
	usage: '<topic>',
	aliases: ['edit'],
	example: 'topic need help error',
	args: true,
	async execute(client, message, args, {config, Ticket}) {

		const guild = client.guilds.cache.get(config.guild);

		let ticket = await Ticket.findOne({
			where: {
				channel: message.channel.id
			}
		});

		if (!ticket)
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(':x: **This isn\'t a ticket channel**')
					.setDescription('Use this command in the ticket channel you want to close, or mention the channel.')
					.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
					.setFooter(guild.name, guild.iconURL())
			);


		let topic = args.join(' ');
		if (topic.length > 256)
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(':x: **Description too long**')
					.setDescription('Please limit your ticket topic to less than 256 characters. A short sentence will do.')
					.setFooter(guild.name, guild.iconURL())
			);

		message.channel.setTopic(`<@${ticket.creator}> | ` + topic);

		Ticket.update({
			topic: topic
		}, {
			where: {
				channel: message.channel.id
			}
		});


		message.channel.send(
			new MessageEmbed()
				.setColor(config.colour)
				.setAuthor(message.author.username, message.author.displayAvatarURL())
				.setTitle(':white_check_mark: **Ticket updated**')
				.setDescription('The topic has been changed.')
				.setFooter(client.user.username, client.user.displayAvatarURL())
		);
	}
};