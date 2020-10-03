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

module.exports = {
	name: 'help',
	description: 'Display help menu',
	usage: '[command]',
	aliases: ['command', 'commands'],
	example: 'help new',
	args: false,
	execute(client, message, args, {config}) {

		const guild = client.guilds.cache.get(config.guild);

		const commands = Array.from(client.commands.values());

		if (!args.length) {
			let cmds = [];

			for (let command of commands) {
				if (command.hide)
					continue;
				if (command.permission && !message.member.hasPermission(command.permission))
					continue;

				let desc = command.description;

				if (desc.length > 50)
					desc = desc.substring(0, 50) + '...';
				cmds.push(`**${config.prefix}${command.name}** **·** ${desc}`);
			}

			message.channel.send(
				new MessageEmbed()
					.setTitle('Commands')
					.setColor(config.colour)
					.setDescription(
						`\nThe commands you have access to are listed below. Type \`${config.prefix}help [command]\` for more information about a specific command.
						\n${cmds.join('\n\n')}
						\nPlease contact a member of staff if you require assistance.`
					)
					.setFooter(guild.name, guild.iconURL())
			).catch((error) => {
				log.warn('Could not send help menu');
				log.error(error);
			});

		} else {
			const name = args[0].toLowerCase();
			const command = client.commands.get(name) || client.commands.find(c => c.aliases && c.aliases.includes(name));

			if (!command)
				return message.channel.send(
					new MessageEmbed()
						.setColor(config.err_colour)
						.setDescription(`:x: **Invalid command name** (\`${config.prefix}help\`)`)
				);


			const cmd = new MessageEmbed()
				.setColor(config.colour)
				.setTitle(command.name);


			if (command.long) {
				cmd.setDescription(command.long);
			} else {
				cmd.setDescription(command.description);
			}
			if (command.aliases) cmd.addField('Aliases', `\`${command.aliases.join(', ')}\``, true);

			if (command.usage) cmd.addField('Usage', `\`${config.prefix}${command.name} ${command.usage}\``, false);

			if (command.usage) cmd.addField('Example', `\`${config.prefix}${command.example}\``, false);


			if (command.permission && !message.member.hasPermission(command.permission)) {
				cmd.addField('Required Permission', `\`${command.permission}\` :exclamation: You don't have permission to use this command`, true);
			} else {
				cmd.addField('Required Permission', `\`${command.permission || 'none'}\``, true);
			}

			message.channel.send(cmd);

		}

		// command ends here
	},
};