const Discord = require('discord.js');
const { version } = require('../package.json');
const config = require('../config.json');
module.exports = {
  name: 'help',
  description: 'Displays help menu',
  usage: '[command]',
  aliases: ['command', 'commands'],
	example: 'help new',
  args: false,
  cooldown: config.cooldown,
  execute(message, args) {
    const client = message.client;
    // command starts here
    message.delete();
    if (config.useEmbeds) {
      const embed = new Discord.RichEmbed()
        .setAuthor(`${client.user.username} / Commands`, client.user.avatarURL)
        .setColor(config.colour)
        .addField("...", `...`, true)
        .addField("...", `...`, true)
        .setFooter(`${client.guilds.get(config.guildID).name} : DiscordTickets by Eartharoid`);
      message.channel.send({
        embed
      })
    } else {
      message.channel.send(`**Prefix =** \`${config.prefix}\`\n**Bot Version =** \`${version}\``)
    }


    // command ends here
  },
};
