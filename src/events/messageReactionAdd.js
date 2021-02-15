/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { join } = require('path');

module.exports = {
	event: 'messageReactionAdd',
	async execute(client, log, [r, u], {config, Ticket, Setting}) {
		if (r.partial) {
			try {
				await r.fetch();
			} catch (err) {
				log.error(err);
				return;
			}
		}

		let panelID = await Setting.findOne({ where: { key: 'panel_msg_id' } });
		if (!panelID) return;

		if (r.message.id !== panelID.get('value')) return;

		if (u.id === client.user.id) return;

		if (r.emoji.name !== config.panel.reaction && r.emoji.id !== config.panel.reaction) return;

		let channel = r.message.channel;

		const supportRole = channel.guild.roles.cache.get(config.staff_role);
		if (!supportRole) {
			return channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setTitle('❌ **Error**')
					.setDescription(`${config.name} has not been set up correctly. Could not find a 'support team' role with the id \`${config.staff_role}\``)
					.setFooter(channel.guild.name, channel.guild.iconURL())
			);
		}

		// everything is cool

		await r.users.remove(u.id); // effectively cancel reaction

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

			try {
				return dm.send(
					new MessageEmbed()
						.setColor(config.err_colour)
						.setAuthor(u.username, u.displayAvatarURL())
						.setTitle(`❌ **You already have ${tickets.count} or more open tickets**`)
						.setDescription(`Use \`${config.prefix}close\` in a server channel to close unneeded tickets.\n\n${ticketList.join(',\n')}`)
						.setFooter(channel.guild.name, channel.guild.iconURL())
				);
			} catch (e) {
				let m = await channel.send(
					new MessageEmbed()
						.setColor(config.err_colour)
						.setAuthor(u.username, u.displayAvatarURL())
						.setTitle(`❌ **You already have ${tickets.count} or more open tickets**`)
						.setDescription(`Use \`${config.prefix}close\` to close unneeded tickets.\n\n${ticketList.join(',\n')}`)
						.setFooter(channel.guild.name + ' | This message will be deleted in 15 seconds', channel.guild.iconURL())
				);
				return m.delete({ timeout: 15000 });
			}
		}

		let topic = config.tickets.default_topic.command;
		
		let ticket = await Ticket.create({
			channel: '',
			creator: u.id,
			open: true,
			archived: false,
			topic: topic
		});

		let name = 'ticket-' + ticket.id;

		channel.guild.channels.create(name, {
			type: 'text',
			topic: `${u} | ${topic}`,
			parent: config.tickets.category,
			permissionOverwrites: [{
				id: channel.guild.roles.everyone,
				deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
			},
			{
				id: client.user,
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY']
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
			reason: 'User requested a new support ticket channel (panel reaction)'
		}).then(async c => {
			Ticket.update({
				channel: c.id
			}, {
				where: {
					id: ticket.id
				}
			});

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

			await c.send(ping + `${u} has created a new ticket`);

			if (config.tickets.send_img) {
				const images = fs.readdirSync(join(__dirname, '../../user/images'));
				await c.send({
					files: [
						join(__dirname, '../../user/images', images[Math.floor(Math.random() * images.length)])
					]
				});
			}

			let text = config.tickets.text
				.replace(/{{ ?name ?}}/gmi, u.username)
				.replace(/{{ ?(tag|mention) ?}}/gmi, u);


			let w = await c.send(
				new MessageEmbed()
					.setColor(config.colour)
					.setAuthor(u.username, u.displayAvatarURL())
					.setDescription(text)
					.addField('Topic', `\`${topic}\``)
					.setFooter(channel.guild.name, channel.guild.iconURL())
			);

			if (config.tickets.pin) await w.pin();
			// await w.pin().then(m => m.delete()); // oopsie, this deletes the pinned message

			if (config.logs.discord.enabled)
				client.channels.cache.get(config.logs.discord.channel).send(
					new MessageEmbed()
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
	}
};
