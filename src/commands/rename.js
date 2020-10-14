/**
 *
 *  @name DiscordTickets
 *  @author iFusion for eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'rename',
	description: 'Rename a ticket channel',
	usage: '<new name>',
	aliases: ['none'],
	example: 'rename important-ticket',
	args: true,
	async execute(client, message, args, {config, Ticket}) {
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
					.setTitle(':x: **This isn\'t a ticket channel**')
					.setDescription('Use this command in the ticket channel you want to rename.')
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
					.setTitle(':x: **No permission**')
					.setDescription('You don\'t have permission to rename this channel as you are not staff.')
					.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
					.setFooter(guild.name, guild.iconURL())
			);

		message.channel.setName(args.join('-')); // new channel name

		message.channel.send(
			new MessageEmbed()
				.setColor(config.colour)
				.setAuthor(message.author.username, message.author.displayAvatarURL())
				.setTitle(':white_check_mark: **Ticket updated**')
				.setDescription('The name has been changed.')
				.setFooter(client.user.username, client.user.displayAvatarURL())
		);
	}
};
