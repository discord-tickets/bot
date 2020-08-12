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

module.exports = {
	event: 'message',
	async execute(client, message, Ticket) {
		if (message.author.bot || message.author.id === client.user.id) return;

		if (message.channel.type === 'dm') {
			log.console(`Received a DM from ${message.author.tag}: ${message.cleanContent}`);
			return message.channel.send(`Hello there, ${message.author.username}!
I am the support bot for **${client.guilds.cache.get(config.guild)}**.
Type \`${config.prefix}new\` on the server to create a new ticket.`);
		}	

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
					.setFooter(message.guild.name, message.guild.iconURL())
			);
		}

		if (command.args && !args.length)
			return message.channel.send(
				new Discord.MessageEmbed()
					.setColor(config.err_colour)
					.addField('Usage', `\`${config.prefix}${command.name} ${command.usage}\`\n`)
					.addField('Help', `Type \`${config.prefix}help ${command.name}\` for more information`)
					.setFooter(message.guild.name, message.guild.iconURL())
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
						.setFooter(message.guild.name, message.guild.iconURL())
				);
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		try {
			command.execute(client, message, args, Ticket);
			log.console(`${message.author.tag} used the '${command.name}' command`);
		} catch (error) {
			log.warn(`An error occurred whilst executing the '${command.name}' command`);
			log.error(error);
			message.channel.send(`:x: An error occurred whilst executing the \`${command.name}\` command.\nThe issue has been reported.`);
		}
	}
};