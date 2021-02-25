/**
 * @name DiscordTickets
 * @author eartharoid <contact@eartharoid.me>
 * @license GNU-GPLv3
 * 
 */

const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { join } = require('path');
const config = require(join(__dirname, '../../user/', require('../').config));
const archive = require('../modules/archive');
const { plural } = require('../modules/utils');
const { Op } = require('sequelize');
const toTime = require('to-time-monthsfork');

// A slight modification to the 'close' command to allow multiple tickets to be closed at once

module.exports = {
	name: 'closeall',
	description: 'Closes all currently open tickets older than a specified time length',
	usage: '[time]',
	aliases: ['ca'],
	example: 'closeall 1mo 1w',
	args: false,
	disabled: !config.commands.closeall.enabled,
	async execute(client, message, args, log, { config, Ticket }) {
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

		if (args.length > 0) {
			let time, maxDate;
			let timestamp = args.join(' ');

			try {
				time = toTime(timestamp).milliseconds();
				maxDate = new Date(Date.now() - time);
			} catch (error) {
				return message.channel.send(
					new MessageEmbed()
						.setColor(config.err_colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle('❌ **Invalid Timestamp**')
						.setDescription(`The timestamp that you specified, \`${timestamp}\`, was invalid.`)
						.addField('Usage', `\`${config.prefix}${this.name}${' ' + this.usage}\`\n`)
						.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
						.setFooter(guild.name, guild.iconURL())
				);
			}
			
			tickets = await Ticket.findAndCountAll({
				where: {
					open: true,
					updatedAt: {
						[Op.lte]: maxDate,
					}
				},
			});
		} else {
			tickets = await Ticket.findAndCountAll({
				where: {
					open: true,
				},
			});
		}

		if (tickets.count === 0) 
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.display)
					.setTitle('❌ **No open tickets**')
					.setDescription('There are no open tickets to close.')
					.setFooter(guild.name, guild.iconURL())
			);

		log.info(`Found ${tickets.count} open tickets`);
		
		if (config.commands.close.confirmation) {
			let success;
			let pre = config.transcripts.text.enabled || config.transcripts.web.enabled
				? `You will be able to view an archived version of each ticket later with \`${config.prefix}transcript <id>\``
				: '';

			let confirm = await message.channel.send(
				new MessageEmbed()
					.setColor(config.colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(`❔ Are you sure you want to close **${tickets.count}** tickets?`)
					.setDescription(`${pre}\n**React with ✅ to confirm.**`)
					.setFooter(guild.name + ' | Expires in 15 seconds', guild.iconURL())
			);

			await confirm.react('✅');

			const collector = confirm.createReactionCollector(
				(reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id, {
					time: 15000,
				}); 

			collector.on('collect', async () => {
				message.channel.send(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle(`**\`${tickets.count}\` tickets closed**`)
						.setDescription(`**\`${tickets.count}\`** tickets closed by ${message.author}`)
						.setFooter(guild.name, guild.iconURL())
				);

				confirm.reactions.removeAll();
				confirm.edit(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle(`✅ ** \`${tickets.count}\` tickets closed**`)
						.setDescription('The channels will be automatically deleted in a few seconds, once the contents have been archived.')
						.setFooter(guild.name, guild.iconURL())
				);

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
			tickets.rows.forEach(async ticket => {
				let users = [];

				if (config.transcripts.text.enabled || config.transcripts.web.enabled) {
					let {
						channel,
						id,
						creator
					} = ticket;

					let user = await client.users.fetch(creator);
					let paths = {
						text: join(__dirname, `../../user/transcripts/text/${channel}.txt`),
						log: join(__dirname, `../../user/transcripts/raw/${channel}.log`),
						json: join(__dirname, `../../user/transcripts/raw/entities/${channel}.json`)
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
							.setTitle(`Ticket ${id}`)
							.setFooter(guild.name, guild.iconURL());
							
						if (fs.existsSync(paths.text)) {
							embed.addField('Text Transcript', 'See attachment');
							res.files = [{
								attachment: paths.text,
								name: `ticket-${id}-${channel}.txt`
							}];
						}

						if (fs.existsSync(paths.log) && fs.existsSync(paths.json)) {
							let data = JSON.parse(fs.readFileSync(paths.json));
							data.entities.users.forEach(u => users.push(u));
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

					await Ticket.update({
						open: false,
					}, {
						where: {
							id,
						}
					});

					log.info(log.format(`${message.author.tag} closed ticket &7${id}&f`));

					client.channels.fetch(channel)
						.then(c => c.delete()
							.then(o => log.info(`Deleted channel with name: '#${o.name}' <${o.id}>`))
							.catch(e => log.error(e)))
						.catch(e => log.error(e));

					if (config.logs.discord.enabled) {
						let embed = new MessageEmbed()
							.setColor(config.colour)
							.setAuthor(message.author.username, message.author.displayAvatarURL())
							.setTitle(`${tickets.count} ${plural('ticket', tickets.count)} closed (${config.prefix}closeall)`)
							.addField('Closed by', message.author, true)
							.setFooter(guild.name, guild.iconURL())
							.setTimestamp();

						if (users.length > 1)
							embed.addField('Members', users.map(u => `<@${u}>`).join('\n'));
						
						client.channels.cache.get(config.logs.discord.channel).send(embed);
					}
				}
			});
		}
		
	},
};
