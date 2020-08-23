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
const config = require('../../user/config');
const fs = require('fs');
const archive = require('../modules/archive');

module.exports = {
	name: 'close',
	description: 'Close a ticket; either a specified (mentioned) channel, or the channel the command is used in.',
	usage: '[ticket]',
	aliases: ['none'],
	example: 'close #ticket-17',
	args: false,
	async execute(client, message, args, Ticket) {

		const guild = client.guilds.cache.get(config.guild);

		const notTicket = new MessageEmbed()
			.setColor(config.err_colour)
			.setAuthor(message.author.username, message.author.displayAvatarURL())
			.setTitle(':x: **This isn\'t a ticket channel**')
			.setDescription('Use this command in the ticket channel you want to close, or mention the channel.')
			.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
			.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
			.setFooter(guild.name, guild.iconURL());

		let ticket;
		let channel = message.mentions.channels.first();
		// || client.channels.resolve(await Ticket.findOne({ where: { id: args[0] } }).channel) // channels.fetch()

		if (!channel) {
			channel = message.channel;

			ticket = await Ticket.findOne({
				where: {
					channel: channel.id
				}
			});
			if (!ticket)
				return channel.send(notTicket);

		} else {

			ticket = await Ticket.findOne({
				where: {
					channel: channel.id
				}
			});
			if (!ticket) {
				notTicket
					.setTitle(':x: **Channel is not a ticket**')
					.setDescription(`${channel} is not a ticket channel.`);
				return channel.send(notTicket);
			}

			if (message.author.id !== ticket.get('creator') && !message.member.roles.cache.has(config.staff_role))
				return channel.send(
					new MessageEmbed()
						.setColor(config.err_colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle(':x: **No permission**')
						.setDescription(`You don't have permission to close ${channel} as it does not belong to you and you are not staff.`)
						.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
						.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
						.setFooter(guild.name, guild.iconURL())
				);
		}

		let success;
		let pre = fs.existsSync(`user/transcripts/text/${channel.id}.txt`) ||
			fs.existsSync(`user/transcripts/raw/${channel.id}.log`) ?
			`You will be able to view an archived version later with \`${config.prefix}transcript ${ticket.get('id')}\`` :
			'';

		let confirm = await message.channel.send(
			new MessageEmbed()
				.setColor(config.colour)
				.setAuthor(message.author.username, message.author.displayAvatarURL())
				.setTitle(':grey_question: Are you sure?')
				.setDescription(`${pre}\n**React with :white_check_mark: to confirm.**`)
				.setFooter(guild.name + ' | Expires in 15 seconds', guild.iconURL())
		);

		await confirm.react('✅');

		const collector = confirm.createReactionCollector(
			(r, u) => r.emoji.name === '✅' && u.id === message.author.id, {
				time: 15000
			});

		collector.on('collect', async () => {
			if (channel.id !== message.channel.id)
				channel.send(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle('**Ticket closed**')
						.setDescription(`Ticket closed by ${message.author}`)
						.setFooter(guild.name, guild.iconURL())
				);

			confirm.reactions.removeAll();
			confirm.edit(
				new MessageEmbed()
					.setColor(config.colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(`:white_check_mark: **Ticket ${ticket.id} closed**`)
					.setDescription('The channel will be automatically deleted in a few seconds, once the contents have been archived.')
					.setFooter(guild.name, guild.iconURL())
			);

			success = true;
			ticket.update({
				open: false
			}, {
				where: {
					channel: channel.id
				}
			});
			setTimeout(() => {
				channel.delete();
				if (channel.id !== message.channel.id)
					message.delete()
						.then(() => confirm.delete());
			}, 15000);

			if (config.transcripts.text.enabled || config.transcripts.web.enabled) {
				let u = await client.users.fetch(ticket.get('creator'));

				if (u) {
					let dm;
					try {
						dm = u.dmChannel || await u.createDM();
					} catch (e) {
						log.warn(`Could not create DM channel with ${u.tag}`);
					}
					

					await dm.send(
						new MessageEmbed()
							.setColor(config.colour)
							.setAuthor(message.author.username, message.author.displayAvatarURL())
							.setTitle(`**Ticket ${ticket.id} closed**`)
							.setDescription('Your ticket has been closed.')
							.setFooter(guild.name, guild.iconURL())
					);

					if (config.transcripts.text.enabled && fs.existsSync(`user/transcripts/text/${channel.id}.txt`)) {
						try {
							await dm.send('A basic text transcript of the ticket channel is attached:', {
								files: [
									`user/transcripts/text/${channel.id}.txt`
								]
							});
						} catch (e) {
							log.warn(`Failed to send text transcript to ${u.tag}`);
						}

					}

					if (config.transcripts.web.enabled) {
						try {
							let url = await archive.export(client, channel);

							await dm.send(
								new MessageEmbed()
									.setColor(config.colour)
									.setAuthor(message.author.username, message.author.displayAvatarURL())
									.setTitle(`**Ticket ${ticket.id} web archive**`)
									.setDescription(`You can view an archive of your ticket channel [here](${url})`)
									.setFooter(guild.name, guild.iconURL())
							);
						} catch (e) {
							log.warn(`Failed to send archive URL to ${u.tag}`);
							log.warn(e);
						}

					}
				}
			}


			log.info(`${message.author.tag} closed a ticket (#ticket-${ticket.get('id')})`);

			if (config.logs.discord.enabled)
				client.channels.cache.get(config.logs.discord.channel).send(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle('Ticket closed')
						.addField('Creator', `<@${ticket.get('creator')}>`, true)
						.addField('Closed by', message.author, true)
						.setFooter(guild.name, guild.iconURL())
						.setTimestamp()
				);
		});


		collector.on('end', () => {
			if (!success) {
				confirm.reactions.removeAll();
				confirm.edit(
					new MessageEmbed()
						.setColor(config.err_colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle(':x: **Expired**')
						.setDescription('You took to long to react; confirmation failed.')
						.setFooter(guild.name, guild.iconURL()));

				message.delete({
					timeout: 10000
				})
					.then(() => confirm.delete());
			}
		});

	}
};