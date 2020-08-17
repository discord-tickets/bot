/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

const Discord = require('discord.js');
const ChildLogger = require('leekslazylogger').ChildLogger;
const log = new ChildLogger();
const config = require('../../user/config');
const fs = require('fs');
const dtf = require('@eartharoid/dtf');

module.exports = {
	event: 'message',
	async execute(client, [message], {Ticket, Setting}) {

		const guild = client.guilds.cache.get(config.guild);
		
		if (message.author.bot || message.author.id === client.user.id) return;

		if (message.channel.type === 'dm') {
			log.console(`Received a DM from ${message.author.tag}: ${message.cleanContent}`);
			return message.channel.send(`Hello there, ${message.author.username}!
I am the support bot for **${guild}**.
Type \`${config.prefix}new\` on the server to create a new ticket.`);
		}

		if (message.guild.id !== guild.id)
			return message.reply(`This bot can only be used within the "${guild}" server`);
		

		
		/**
		 * 
		 * Ticket transcripts
		 * 
		 */
		let ticket = await Ticket.findOne({ where: { channel: message.channel.id } });
		if(ticket) {
			if(config.transcripts.text.enabled) {
				let path = `user/transcripts/text/${message.channel.id}.txt`;
				let time = dtf('HH:mm:ss n_D MMM YY', message.createdAt),
					name = message.author.tag,
					msg = message.cleanContent;
				let string = `[${time}] [${name}] :> ${msg}`;
				fs.appendFileSync(path, string + '\n');
			}

			if(config.transcripts.web.enabled) {
				let path = `user/transcripts/raw/${message.channel.id}.log`;
				let embeds = [];
				for (let embed in message.embeds)
					embeds.push(message.embeds[embed].toJSON());
				fs.appendFileSync(path, JSON.stringify({
					id: message.id,
					type: 'UNKNOWN',
					author: message.author.id,
					content: message.content,
					// deleted: false, 
					time: message.createdTimestamp,
					embeds: embeds,
					attachments: [...message.attachments]
				}) + ', \n');
			}
		}
		
		/**
		 * 
		 * Command handler
		 * 
		 */

		const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|\\${config.prefix})\\s*`);
		if (!prefixRegex.test(message.content)) return;
		const [, matchedPrefix] = message.content.match(prefixRegex);
		const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
		const commandName = args.shift().toLowerCase();
		const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
		if (!command || commandName === 'none') return;

		if (command.permission && !message.member.hasPermission(command.permission)) {
			log.console(`${message.author.tag} tried to use the '${command.name}' command without permission`);
			return message.channel.send(
				new Discord.MessageEmbed()
					.setColor(config.err_colour)
					.setTitle(':x: No permission')
					.setDescription(`**You do not have permission to use the \`${command.name}\` command** (requires \`${command.permission}\`).`)
					.setFooter(guild.name, guild.iconURL())
			);
		}

		if (command.args && !args.length)
			return message.channel.send(
				new Discord.MessageEmbed()
					.setColor(config.err_colour)
					.addField('Usage', `\`${config.prefix}${command.name} ${command.usage}\`\n`)
					.addField('Help', `Type \`${config.prefix}help ${command.name}\` for more information`)
					.setFooter(guild.name, guild.iconURL())
			);

		if (!client.cooldowns.has(command.name)) client.cooldowns.set(command.name, new Discord.Collection());
	
		const now = Date.now();
		const timestamps = client.cooldowns.get(command.name);
		const cooldownAmount = (command.cooldown || config.cooldown) * 1000;

		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				log.console(`${message.author.tag} attempted to use the '${command.name}' command before the cooldown was over`);
				return message.channel.send(
					new Discord.MessageEmbed()
						.setColor(config.err_colour)
						.setDescription(`:x: Please wait ${timeLeft.toFixed(1)} second(s) before reusing the \`${command.name}\` command.`)
						.setFooter(guild.name, guild.iconURL())
				);
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		try {
			command.execute(client, message, args, Ticket, Setting);
			log.console(`${message.author.tag} used the '${command.name}' command`);
		} catch (error) {
			log.warn(`An error occurred whilst executing the '${command.name}' command`);
			log.error(error);
			message.channel.send(`:x: An error occurred whilst executing the \`${command.name}\` command.\nThe issue has been reported.`);
		}
	}
};