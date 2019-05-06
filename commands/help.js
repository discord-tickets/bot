const Discord = require('discord.js');
const { version } = require('../package.json');
const config = require('../config.json');
const log = require(`leekslazylogger`);
module.exports = {
  name: 'help',
  description: 'Displays help menu',
  usage: '[command]',
  aliases: ['command', 'commands'],
	example: 'help new',
  args: false,
  cooldown: config.cooldown,
	guildOnly: true,
  execute(message, args) {
    const client = message.client;
    // command starts here
    message.delete();

		const data = [];
		const { commands } = message.client;






    if (config.useEmbeds) {
			if (!args.length) {
				data.push('__**Commands**__');
				data.push(commands.map(command => `**${config.prefix}${command.name}** : \`${command.description}\``).join('\n'));
				data.push(`\nType\`${config.prefix}help [command]\` for more information about a specific command.`);

				const embed = new Discord.RichEmbed()
	        .setTitle("Commands")
	        .setColor(config.colour)
					.setDescription(`\nType\`${config.prefix}help [command]\` for more information about a specific command.`)
	        // .addField("...", `...`, true)
	        // .addField("...", `...`, true)
	        .setFooter(`DiscordTickets by Eartharoid`);

					var cmds = [];
					cmds.push(commands.map(command => embed.addField(`${config.prefix}${command.name}`, `\`${command.description}\``)));
	      message.channel.send(embed)
					.then(() => {
						if (message.channel.type === 'dm') return;
						// message.channel.send(`A list of commands has been sent to you.`);
					})
					.catch(error => {
						// console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
						log.warn(`Could not DM help menu to ${message.author.tag}, sending to server channel instead`);
						message.channel.send(`:x: **Sorry!** There was an error whilst sending the help menu via DMs.`)
						message.channel.send(data, { split: true })
					});
			} else {
				const name = args[0].toLowerCase();
				const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

				if (!command) {
					const notCmd = new Discord.RichEmbed()
	          .setColor("#E74C3C")
	          .setDescription(`:x: **Invalid command name** (\`${config.prefix}help\`)`)
					return message.channel.send(notCmd)
				}

				const cmd = new Discord.RichEmbed()
	        .setColor(config.colour)
					.addField(`Command`,`\`${command.name}\``, true)
	        .setFooter(`DiscordTickets by Eartharoid`);

				if (command.aliases) cmd.addField("Aliases", `\`${command.aliases.join(', ')}\``, true);
				if (command.description) cmd.addField("Description", `\`${command.description}\``, false);
				if (command.usage) cmd.addField("Usage", `\`${config.prefix}${command.name} ${command.usage}\``, false)
				if (command.example) cmd.addField("Example", `\`${config.prefix}${command.example}\``, false);
				message.channel.send(cmd)

			}


    } else {
      // message.channel.send(`**Prefix =** \`${config.prefix}\`\n**Bot Version =** \`${version}\``)

			if (!args.length) {
				data.push('__**Commands**__');
				data.push(commands.map(command => `**${config.prefix}${command.name}** : \`${command.description}\``).join('\n'));
				data.push(`\nType\`${config.prefix}help [command]\` for more information about a specific command.`);

				return message.author.send(data, { split: true })
					.then(() => {
						if (message.channel.type === 'dm') return;
						// message.channel.send(`A list of commands has been sent to you.`);
					})
					.catch(error => {
						// console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
						log.warn(`Could not DM help menu to ${message.author.tag}, sending to server channel instead`);
						message.channel.send(`:x: **Sorry!** There was an error whilst sending the help menu via DMs.`)
						message.channel.send(data, { split: true })
					});
			}

			const name = args[0].toLowerCase();
			const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

			if (!command) {
				return message.reply(':x: **Invalid command**');
			}

			data.push(`**Command:** \`${command.name}\``);

			if (command.aliases) data.push(`**Aliases:** \`${command.aliases.join(', ')}\``);
			if (command.description) data.push(`**Description:** \`${command.description}\``);
			if (command.usage) data.push(`**Usage:** \`${config.prefix}${command.name} ${command.usage}\``);
			if (command.example) data.push(`**Example:** \`${command.example}\``);

			data.push(`**Cooldown:** \`${command.cooldown || 3} second(s)\``);

	message.channel.send(data, { split: true });
    }



    // command ends here
  },
};
