/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

const ChildLogger = require('leekslazylogger').ChildLogger;
const log = new ChildLogger();
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
	name: 'new',
	description: 'Create a new support ticket',
	usage: '[brief description]',
	aliases: ['ticket', 'open'],
	example: 'new my server won\'t start',
	args: false,
	async execute(client, message, args, {config, Ticket}) {

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


		let tickets = await Ticket.findAndCountAll({
			where: {
				creator: message.author.id,
				open: true
			},
			limit: config.tickets.max
		});

		if (tickets.count >= config.tickets.max) {
			let ticketList = [];
			for (let t in tickets.rows)  {
				let desc = tickets.rows[t].topic.substring(0, 30);
				ticketList
					.push(`<#${tickets.rows[t].channel}>: \`${desc}${desc.length > 30 ? '...' : ''}\``);
			}

			let m = await message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(`:x: **You already have ${tickets.count} or more open tickets**`)
					.setDescription(`Use \`${config.prefix}close\` to close unneeded tickets.\n\n${ticketList.join(',\n')}`)
					.setFooter(guild.name + ' | This message will be deleted in 15 seconds', guild.iconURL())
			);

			return setTimeout(async () => {
				await message.delete();
				await m.delete();
			}, 15000);
		}


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
		else if (topic.length < 1)
			topic = 'No topic given';


		let ticket = await Ticket.create({
			channel: '',
			creator: message.author.id,
			open: true,
			archived: false,
			topic: topic
		});

		let name = 'ticket-' + ticket.get('id');

		guild.channels.create(name, {
			type: 'text',
			topic: `${message.author} | ${topic}`,
			parent: config.tickets.category,
			permissionOverwrites: [{
				id: guild.roles.everyone,
				deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
			},
			{
				id: client.user,
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY']
			},
			{
				id: message.member,
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY']
			},
			{
				id: supportRole,
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY']
			}
			],
			reason: 'User requested a new support ticket channel'
		}).then(async c => {

			Ticket.update({
				channel: c.id
			}, {
				where: {
					id: ticket.id
				}
			});

			let m = await message.channel.send(
				new MessageEmbed()
					.setColor(config.colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(':white_check_mark: **Ticket created**')
					.setDescription(`Your ticket has been created: ${c}`)
					.setFooter(client.user.username + ' | This message will be deleted in 15 seconds', client.user.displayAvatarURL())
			);

			setTimeout(async () => {
				await message.delete();
				await m.delete();
			}, 15000);

			// require('../modules/archive').create(client, c); // create files

			let ping;
			switch (config.tickets.ping) {
			case 'staff':
				ping = `<@&${config.staff_role}>,\n`;
				break;
			case false:
				ping = '';
				break;
			default:
				ping = `@${config.tickets.ping},\n`;
			}

			await c.send(ping + `${message.author} has created a new ticket`);

			if (config.tickets.send_img) {
				const images = fs.readdirSync('user/images');
				await c.send({
					files: [
						'user/images/' +
						images[Math.floor(Math.random() * images.length)]
					]
				});
			}

			let text = config.tickets.text
				.replace('{{ name }}', message.author.username)
				.replace('{{ tag }}', message.author);


			let w = await c.send(
				new MessageEmbed()
					.setColor(config.colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setDescription(text)
					.addField('Topic', `\`${topic}\``)
					.setFooter(guild.name, guild.iconURL())
			);

			if (config.tickets.pin)
				await w.pin();
				// await w.pin().then(m => m.delete()); // oopsie, this deletes the pinned message

			if (config.logs.discord.enabled)
				client.channels.cache.get(config.logs.discord.channel).send(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle('New ticket')
						.setDescription(`\`${topic}\``)
						.addField('Creator', message.author, true)
						.addField('Channel', c, true)
						.setFooter(guild.name, guild.iconURL())
						.setTimestamp()
				);

			log.info(`${message.author.tag} created a new ticket (#${name})`);


		}).catch(log.error);
	},
};
