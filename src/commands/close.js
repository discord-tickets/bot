/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

const ChildLogger = require('leekslazylogger').ChildLogger;
const log = new ChildLogger();
const {
	MessageEmbed
} = require('discord.js');
const fs = require('fs');
const archive = require('../modules/archive');

module.exports = {
	name: 'close',
	description: 'Close a ticket; either a specified (mentioned) channel, or the channel the command is used in.',
	usage: '[ticket]',
	aliases: ['none'],
	example: 'close #ticket-17',
	args: false,
	async execute(client, message, args, {
		config,
		Ticket
	}) {

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
				return message.channel.send(notTicket);
			}

			if (message.author.id !== ticket.creator && !message.member.roles.cache.has(config.staff_role))
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
			`You will be able to view an archived version later with \`${config.prefix}transcript ${ticket.id}\`` :
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

			if (config.transcripts.text.enabled || config.transcripts.web.enabled) {
				let u = await client.users.fetch(ticket.creator);

				if (u) {
					let dm;
					try {
						dm = u.dmChannel || await u.createDM();
					} catch (e) {
						log.warn(`Could not create DM channel with ${u.tag}`);
					}


					let res = {};
					const embed = new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle(`Ticket ${ticket.id}`)
						.setFooter(guild.name, guild.iconURL());

					if (fs.existsSync(`user/transcripts/text/${ticket.get('channel')}.txt`)) {
						embed.addField('Text transcript', 'See attachment');
						res.files = [{
							attachment: `user/transcripts/text/${ticket.get('channel')}.txt`,
							name: `ticket-${ticket.id}-${ticket.get('channel')}.txt`
						}];
					}

					if (fs.existsSync(`user/transcripts/raw/${ticket.get('channel')}.log`)) 
						embed.addField('Web archive', `${await archive.export(Ticket, channel)}`);
						
			
					if (embed.fields.length < 1)
						embed.setDescription(`No text transcripts or archive data exists for ticket ${ticket.id}`);

					res.embed = embed;

					dm.send(res).then();
				}
			}


			// update database
			success = true;
			ticket.update({
				open: false
			}, {
				where: {
					channel: channel.id
				}
			});

			// delete messages and channel
			setTimeout(() => {
				channel.delete();
				if (channel.id !== message.channel.id)
					message.delete()
						.then(() => confirm.delete());
			}, 5000);

			log.info(`${message.author.tag} closed a ticket (#ticket-${ticket.id})`);

			if (config.logs.discord.enabled)
				client.channels.cache.get(config.logs.discord.channel).send(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle('Ticket closed')
						.addField('Creator', `<@${ticket.creator}>`, true)
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