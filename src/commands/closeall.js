/**
 * @name DiscordTickets
 * @author eartharoid <contact@eartharoid.me>
 * @license GNU-GPLv3
 * 
 */

const Logger = require('leekslazylogger');
const log = new Logger();
const {
	MessageEmbed
} = require('discord.js');
const fs = require('fs');
const { join } = require('path');
const config = require(join(__dirname, '../../user/', require('../').config));
const archive = require('../modules/archive');

// Similar to 'close' command, however it iterates through them.

module.exports = {
	name: 'closeall',
	description: 'Closes all currently open tickets.',
	usage: '',
	aliases: ['ca'],
	example: 'closeall',
	args: false,
	disabled: !config.commands.new.enabled,
	async execute(client, message, args, {
		config,
		Ticket
	}) {
		const guild = client.guilds.cache.get(config.guild);

		if (!message.member.roles.cache.has(config.staff_role))
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **No permission**')
					.setDescription('You do not have permission to use this command as you are not a staff member.')
					.addField('Usage', `\`${config.prefix}${this.name}${' ' + this.usage}\`\n`)
					.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
					.setFooter(guild.name, guild.iconURL())
			);
		
		let tickets;
		let channel;

		channel = message.channel;
		tickets = await Ticket.findAll({
			where: {
				open: true,
			}
		});

		if (tickets.length == 0) 
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.display)
					.setTitle('❌ **No open tickets**')
					.setDescription('There are no open tickets to close.')
					.setFooter(guild.name, guild.iconURL())
			);

		log.info(`Found ${tickets.length} open tickets`);
		
		if (config.commands.close.confirmation) {
			let success;
			let pre = `Transcript versions may be available using the \`${config.prefix}\``;

			let confirm = await message.channel.send(
				new MessageEmbed()
					.setColor(config.colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❔ Are you sure?')
					.setDescription(`${pre}\n**React with ✅ to confirm.**`)
					.setFooter(guild.name + ' | Expires in 15 seconds', guild.iconURL())
			);

			await confirm.react('✅');

			const collector = confirm.createReactionCollector(
				(reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {
					time: 15000,
				}); 

			collector.on('collect', async () => {
				if (channel.id != message.channel.id) {
					channel.send(
						new MessageEmbed()
							.setColor(config.colour)
							.setAuthor(message.author.username, message.author.displayAvatarURL())
							.setTitle(`**\`${tickets.length}\` tickets closed**`)
							.setDescription(`**\`${tickets.length}\`** tickets closed by ${message.author}`)
							.setFooter(guild.name, guild.iconURL())
					);
				}

				confirm.reactions.removeAll();
				confirm.edit(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle(`✅ ** \`${tickets.length}\` tickets closed**`)
						.setDescription('The channels will be automatically deleted in a few seconds, once the contents have been archived.')
						.setFooter(guild.name, guild.iconURL())
				);

				if (channel.id !== message.channel.id)
					message.delete({
						timeout: 5000,
					}).then(() => confirm.delete());

				success = true;
				closeAll();
			});

			collector.on('end', () => {
				if (!success) {
					confirm.reactions.removeAll();
					confirm.edit(
						new MessageEmbed()
							.setColor(config.err_colour)
							.setAuthor(message.author.username, message.author.displayAvatarURL())
							.setTitle('❌ **Expired**')
							.setDescription('You took too long to react; confirmation failed.')
							.setFooter(guild.name, guild.iconURL()));

					message.delete({
						timeout: 10000
					}).then(() => confirm.delete());
				}
			});
		} else {
			closeAll();
		}

		async function closeAll() {
			let users = [];

			if (config.transcripts.text.enabled || config.transcripts.web.enabled) {

				// LOOP START
				tickets.forEach(async ticket => {
					let user = await client.users.fetch(ticket.creator);
					let paths = {
						text: join(__dirname, `../../user/transcripts/text/${ticket.get('channel')}.txt`),
						log: join(__dirname, `../../user/transcripts/raw/${ticket.get('channel')}.log`),
						json: join(__dirname, `../../user/transcripts/raw/entities/${ticket.get('channel')}.json`)
					};

					if (user) {
						let dm;
						try {
							dm = user.dmChannel || await user.createDM();
						} catch (e) {
							log.warn(`Could not create DM channel with ${user.tag}`);
						}

						let res = {};
						const embed = new MessageEmbed()
							.setColor(config.colour)
							.setAuthor(message.author.username)
							.setTitle(`${tickets.length} tickets`)
							.setFooter(guild.name, guild.iconURL());
						
						if (fs.existsSync(paths.text)) {
							embed.addField('Text Transcript', 'See attachment');
							res.files = [{
								attachment: paths.text,
								name: `ticket-${ticket.id}-${ticket.get('channel')}.txt`
							}];
						}

						if (fs.existsSync(paths.log) && fs.existsSync(paths.json)) {
							let data = JSON.parse(fs.readFileSync(paths.json));
							for (user in data.entities.users) users.push(user);
							embed.addField('Web archive', await archive.export(Ticket, channel));
						}

						res.embed = embed;

						try {
							if (config.commands.close.send_transcripts) dm.send(res);
							if (config.transcripts.channel.length > 1) client.channels.cache.get(config.transcripts.channel).send(res);
						} catch (e) {
							message.channel.send('❌ Couldn\'t send DM or transcript log message');
						}
					}

				});
			}
		}

		// TODO: possibly make users allow to close all of their issues?
		
	},
};