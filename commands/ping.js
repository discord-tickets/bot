const Discord = require('discord.js');
const config = require('../config.json');
module.exports = {
  name: 'ping',
  description: 'Calculate latency',
  usage: '',
  aliases: ['none'],
  example: '',
  args: false,
  cooldown: config.cooldown,
  guildOnly: true,
  execute(message, args) {
    const client = message.client;
    // command starts here
    message.delete();
    const embed = new Discord.RichEmbed()
        .setAuthor(`${client.user.username} / Pong!`, client.user.avatarURL)
        .setColor(config.colour)
        .setTimestamp()
        .addField("API Latency", `${Math.round(message.client.ping)}ms`, true)
        .setFooter(`${client.guilds.get(config.guildID).name} : DiscordTickets by Eartharoid`);
    message.channel.send({embed})




    // command ends here
  },
};
