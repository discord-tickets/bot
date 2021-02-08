/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

const { Collection, MessageEmbed } = require('discord.js');
const archive = require('../modules/archive');

module.exports = {
	event: 'message',
	async execute(client, log, [message], {config, Ticket, Setting}) {

		const guild = client.guilds.cache.get(config.guild);

		if (message.channel.type === 'dm' && !message.author.bot) {
			log.console(`Received a DM from ${message.author.tag}: ${message.cleanContent}`);
			return message.channel.send(`Hello there, ${message.author.username}!
I am the support bot for **${guild}**.
Type \`${config.prefix}new\` on the server to create a new ticket.`);
		} // stop here if is DM

		/**
		 * Ticket transcripts
		 * (bots currently still allowed)
		 */

		let ticket = await Ticket.findOne({ where: { channel: message.channel.id } });
		if (ticket) {
			archive.add(message); // add message to archive
			// Update the ticket updated at so closeall can get most recent
			ticket.changed('updatedAt', true);
			ticket.save();
		}

		if (message.author.bot || message.author.id === client.user.id) return; // goodbye bots


		/**
		 * Command handler
		 * (no bots / self)
		 */

		const regex = new RegExp(`^(<@!?${client.user.id}>|\\${config.prefix.toLowerCase()})\\s*`);
		if (!regex.test(message.content.toLowerCase())) return; // not a command

		const [, prefix] = message.content.toLowerCase().match(regex);
		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const commandName = args.shift().toLowerCase();
		const command = client.commands.get(commandName)
			|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		if (!command || commandName === 'none') return; // not an existing command

		if (message.guild.id !== guild.id) return message.reply(`This bot can only be used within the "${guild}" server`); // not in this server

		if (command.permission && !message.member.hasPermission(command.permission)) {
			log.console(`${message.author.tag} tried to use the '${command.name}' command without permission`);
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setTitle('❌ No permission')
					.setDescription(`**You do not have permission to use the \`${command.name}\` command** (requires \`${command.permission}\`).`)
					.setFooter(guild.name, guild.iconURL())
			);
		}

		if (command.args && !args.length) {
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.addField('Usage', `\`${config.prefix}${command.name} ${command.usage}\`\n`)
					.addField('Help', `Type \`${config.prefix}help ${command.name}\` for more information`)
					.setFooter(guild.name, guild.iconURL())
			);
		}

		if (!client.cooldowns.has(command.name)) client.cooldowns.set(command.name, new Collection());

		const now = Date.now();
		const timestamps = client.cooldowns.get(command.name);
		const cooldownAmount = (command.cooldown || config.cooldown) * 1000;

		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				log.console(`${message.author.tag} attempted to use the '${command.name}' command before the cooldown was over`);
				return message.channel.send(
					new MessageEmbed()
						.setColor(config.err_colour)
						.setDescription(`❌ Please wait ${timeLeft.toFixed(1)} second(s) before reusing the \`${command.name}\` command.`)
						.setFooter(guild.name, guild.iconURL())
				);
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		try {
			command.execute(client, message, args, log, {config, Ticket, Setting});
			log.console(`${message.author.tag} used the '${command.name}' command`);
		} catch (error) {
			log.warn(`An error occurred whilst executing the '${command.name}' command`);
			log.error(error);
			message.channel.send(`❌ An error occurred whilst executing the \`${command.name}\` command.`);
		}
	}
};
