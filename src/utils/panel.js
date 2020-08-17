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
const fs = require('fs');
const config = require('../../user/config');

module.exports = async (client, Ticket, Setting) => {

	let panelID = await Setting.findOne({ where: { key: 'panel_msg_id' } });
	if (!panelID) return;

	let chanID = await Setting.findOne({ where: { key: 'panel_chan_id' } });
	if (!chanID) return;

	let channel = client.channels.cache.get(chanID.get('value'));
	if (!channel)
		return Setting.destroy({ where: { key: 'panel_chan_id' } });

	let panel = channel.messages.cache.get(panelID.get('value'));
	if(!panel)
		return Setting.destroy({ where: { key: 'panel_msg_id' } });


	const collector = panel.createReactionCollector(
		(r, u) => r.emoji.name === config.panel.reaction && u.id !== client.user.id);

	collector.on('collect', async (r, u) => {
		await r.users.remove(u.id); // effectively cancel reaction

		const supportRole = channel.guild.roles.cache.get(config.staff_role);
		if (!supportRole)
			return channel.send(
				new Discord.MessageEmbed()
					.setColor(config.err_colour)
					.setTitle(':x: **Error**')
					.setDescription(`${config.name} has not been set up correctly. Could not find a 'support team' role with the id \`${config.staff_role}\``)
					.setFooter(channel.guild.name, channel.guild.iconURL())
			);
		
		let tickets = await Ticket.findAndCountAll({
			where: {
				creator: u.id,
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
			let dm = u.dmChannel || await u.createDM();
				
			let m = await dm.send(
				new Discord.MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(u.username, u.displayAvatarURL())
					.setTitle(`:x: **You already have ${tickets.count} or more open tickets**`)
					.setDescription(`Use \`${config.prefix}close\` to close unneeded tickets.\n\n${ticketList.join(',\n')}`)
					.setFooter(channel.guild.name + ' | This message will be deleted in 15 seconds', channel.guild.iconURL())
			);
	
			return m.delete({ timeout: 15000 });
		}

		let topic = 'No topic given (created via panel)';

		let ticket = await Ticket.create({
			channel: '',
			creator: u.id,
			open: true,
			archived: false,
			topic: topic
		});

		let name = 'ticket-' + ticket.get('id');

		channel.guild.channels.create(name, {
			type: 'text',
			topic: `${u} | ${topic}`,
			parent: config.tickets.category,
			permissionOverwrites: [{
				id: channel.guild.roles.everyone,
				deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
			},
			{
				id: channel.guild.member(u),
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

			await c.send(ping + `${u} has created a new ticket`);

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
				.replace('{{ name }}', u.username)
				.replace('{{ tag }}', u);


			let w = await c.send(
				new Discord.MessageEmbed()
					.setColor(config.colour)
					.setAuthor(u.username, u.displayAvatarURL())
					.setDescription(text)
					.addField('Topic', `\`${topic}\``)
					.setFooter(channel.guild.name, channel.guild.iconURL())
			);

			if (config.tickets.pin)
				await w.pin();
				// await w.pin().then(m => m.delete()); // oopsie, this deletes the pinned message

			if (config.logs.discord.enabled)
				client.channels.cache.get(config.logs.discord.channel).send(
					new Discord.MessageEmbed()
						.setColor(config.colour)
						.setAuthor(u.username, u.displayAvatarURL())
						.setTitle('New ticket (via panel)')
						.setDescription(`\`${topic}\``)
						.addField('Creator', u, true)
						.addField('Channel', c, true)
						.setFooter(channel.guild.name, channel.guild.iconURL())
						.setTimestamp()
				);

			log.info(`${u.tag} created a new ticket (#${name}) via panel`);


		}).catch(log.error);


	});
	
};