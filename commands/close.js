const Discord = require('discord.js');
const config = require('../config.json');
const log = require(`../handlers/logger.js`);
module.exports = {
  name: 'close',
  description: 'Close a ticket',
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
    if(!message.channel.name.startsWith('ticket-')) { // // !message.channel.name.length() == 15 &&
      if(config.useEmbeds) {
        const notTicket = new Discord.RichEmbed()
            .setColor("#E74C3C")
            .setDescription(`:x: **This command can only be used within a ticket channel**`)
        return message.channel.send(notTicket);
      } else {
        return message.channel.send(`:x: **This command can only be used within a ticket channel**`)
      }
    } else {
      try {
        message.channel.delete()
        // log
  	    if(config.useEmbeds) {
  	      const embed = new Discord.RichEmbed()
  	        .setAuthor(`${client.user.username} / Ticket Log`, client.user.avatarURL)
  	        .setTitle("Ticket Closed")
  					.setColor(config.colour)
  	        .addField("Username", message.author, true)
  	        .addField("Channel", message.channel.name, true)
  	        .setFooter(`DiscordTickets`)
  					.setTimestamp();
  	      client.channels.get(config.logChannel).send({embed})
  	    } else {
  	      client.channels.get(config.logChannel).send(`Ticket closed by **${message.author.tag} (${message.author.id})**`);
  	    }
  			log.info(`${message.author.tag} closed a ticket (#${message.channel.name})`)

      } catch(error) {
        log.error(leeks.colours.red(error));
      }
    }




    // command ends here
  },
};
