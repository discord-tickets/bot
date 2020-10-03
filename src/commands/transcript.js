/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

const fs = require('fs');
const {
	MessageEmbed
} = require('discord.js');

module.exports = {
	name: 'transcript',
	description: 'Download a transcript',
	usage: '<ticket-id>',
	aliases: ['archive', 'download'],
	example: 'transcript 57',
	args: true,
	async execute(client, message, args, {config, Ticket}) {

		const guild = client.guilds.cache.get(config.guild);
		const id = args[0];

		let ticket = await Ticket.findOne({
			where: {
				id: id,
				open: false
			}
		});


		if (!ticket)
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(':x: **Unknown ticket**')
					.setDescription('Couldn\'t find a closed ticket with that ID')
					.setFooter(guild.name, guild.iconURL())
			);

		if (message.author.id !== ticket.creator && !message.member.roles.cache.has(config.staff_role))
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(':x: **No permission**')
					.setDescription(`You don't have permission to view ticket ${id} as it does not belong to you and you are not staff.`)
					.setFooter(guild.name, guild.iconURL())
			);
		let res = {};
		const embed = new MessageEmbed()
			.setColor(config.colour)
			.setAuthor(message.author.username, message.author.displayAvatarURL())
			.setTitle(`Ticket ${id}`)
			.setFooter(guild.name, guild.iconURL());

		if (fs.existsSync(`user/transcripts/text/${ticket.channel}.txt`)) {
			embed.addField('Text transcript', 'See attachment');
			res.files = [
				{
					attachment: `user/transcripts/text/${ticket.channel}.txt`,
					name: `ticket-${id}-${ticket.channel}.txt`
				}
			];
		}


		const BASE_URL = config.transcripts.web.server;
		if (config.transcripts.web.enabled)
			embed.addField('Web archive', `${BASE_URL}/${ticket.creator}/${ticket.channel}`);

		if (embed.fields.length < 1)
			embed.setDescription(`No text transcripts or archive data exists for ticket ${id}`);

		res.embed = embed;

		let channel;
		try {
			channel = message.author.dmChannel || await message.author.createDM();
		} catch (e) {
			channel = message.channel;
		}

		channel.send(res).then(m => {
			if (channel.id === message.channel.id)
				m.delete({timeout: 15000});
		});
		message.delete({timeout: 1500});
	}
};