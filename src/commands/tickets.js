/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const config = require('../../user/' + require('../').config);

module.exports = {
	name: 'tickets',
	description: 'List your recent tickets to access transcripts / archives.',
	usage: '[@member]',
	aliases: ['list'],
	example: '',
	args: false,
	async execute(client, message, args, Ticket) {

		const guild = client.guilds.cache.get(config.guild);
		
		const supportRole = guild.roles.cache.get(config.staff_role);
		if (!supportRole)
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setTitle(':x: **Error**')
					.setDescription(`${config.name} has not been set up correctly. Could not find a 'support team' role with the id \`${config.staff_role}\``)
					.setFooter(guild.name, guild.iconURL())
			);

		let context = 'self';
		let user = message.mentions.users.first() || guild.members.cache.get(args[0]);
		
		if(user) {
			if(!message.member.roles.cache.has(config.staff_role))
				return message.channel.send(
					new MessageEmbed()
						.setColor(config.err_colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle(':x: **No permission**')
						.setDescription('You don\'t have permission to list others\' tickets as you are not staff.')
						.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
						.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
						.setFooter(guild.name, guild.iconURL())
				);

			context = 'staff';
		} else {
			user = message.author;
		}


		let openTickets = await Ticket.findAndCountAll({
			where: {
				creator: user.id,
				open: true
			}
		});

		let closedTickets = await Ticket.findAndCountAll({
			where: {
				creator: user.id,
				open: false
			}
		});

		closedTickets.rows = closedTickets.rows.slice(-10); // get most recent 10

		let embed = new MessageEmbed()
			.setColor(config.colour)
			.setAuthor(user.username, user.displayAvatarURL())
			.setTitle(`${context === 'self' ? 'Your' : user.username + '\'s'} tickets`)
			.setFooter(guild.name + ' | This message will be deleted in 60 seconds', guild.iconURL());

		if(config.transcripts.web.enabled)
			embed.setDescription(`You can access all of your ticket archives on the [web portal](${config.transcripts.web.server}/${user.id}).`);
		
		let open = [],
			closed = [];

	
		for (let t in openTickets.rows)  {
			let desc = openTickets.rows[t].topic.substring(0, 30);
			open.push(`> <#${openTickets.rows[t].channel}>: \`${desc}${desc.length > 20 ? '...' : ''}\``);
		
		}
		
		for (let t in closedTickets.rows)  {
			let desc = closedTickets.rows[t].topic.substring(0, 30);
			let transcript = '';
			let c = closedTickets.rows[t].channel;
			if(fs.existsSync(`user/transcripts/text/${c}.txt`) || fs.existsSync(`user/transcripts/raw/${c}.log`))
				transcript = `\n> Type \`${config.prefix}transcript ${closedTickets.rows[t].id}\` to view.`;

			closed.push(`> **#${closedTickets.rows[t].id}**: \`${desc}${desc.length > 20 ? '...' : ''}\`${transcript}`);
		
		}
		let pre = context === 'self' ? 'You have' : user.username + ' has';
		embed.addField('Open tickets', openTickets.count === 0 ? `${pre} no open tickets.` : open.join('\n\n'), false);
		embed.addField('Closed tickets', closedTickets.count === 0 ? `${pre} no old tickets` : closed.join('\n\n'), false);
			
		message.delete({timeout: 15000});

		let channel;
		try {
			channel = message.author.dmChannel || await message.author.createDM();
			message.channel.send('Sent to DM').then(msg => msg.delete({timeout: 15000}));
		} catch (e) {
			channel = message.channel;
		}

		let m = await channel.send(embed);
		m.delete({timeout: 60000});
	},
};