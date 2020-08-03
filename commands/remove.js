const Discord = require('discord.js');
const config = require('../config.json');
const log = require(`leekslazylogger`);

module.exports = {
  name: 'remove',
  description: 'Remove a member from a ticket',
  usage: '<@member>',
  aliases: ['kick'],
  example: 'remove @exampleUser',
  args: true,
  cooldown: config.cooldown,
  guildOnly: true,
  execute(message, args) {
    const client = message.client;
    // command starts here
    message.delete();
    if (!message.channel.name.startsWith('ticket-')) {
      if (config.useEmbeds) {
        const notTicket = new Discord.RichEmbed()
            .setColor("#E74C3C")
            .setDescription(`:x: **This command can only be used within a ticket channel**`)
        return message.channel.send(notTicket);
      } else {
        return message.channel.send(`:x: **This command can only be used within a ticket channel**`)
      }
    }

    let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if (!user) {
      if (config.useEmbeds) {
        const err1 = new Discord.RichEmbed()
            .setColor("#E74C3C")
            .setDescription(`:x: **Unknown user.** Please mention a valid user.`)
            return message.channel.send(err1);
      } else {
        return message.channel.send(`:x: **Unknown user.** Please mention a valid user.`);
      }
    }
    try {
    message.channel.overwritePermissions(user, {
      SEND_MESSAGES: false,
      READ_MESSAGES: false
    });
    if (config.useEmbeds) {
      const removed = new Discord.RichEmbed()
          .setColor(config.colour)
          .setDescription(`${user} has been removed.`)
          message.channel.send(removed);
    } else {
       message.channel.send(`${user} has been removed.`);
    }
    // log
    if (config.useEmbeds) {
      const embed = new Discord.RichEmbed()
        .setAuthor(`${client.user.username} / Ticket Log`, client.user.avatarURL)
        .setTitle("User Removed")
        .setColor(config.colour)
        .addField("Username", user, true)
        .addField("Removed by", message.author, true)
        .addField("Channel", message.channel, true)
        .setFooter(`DiscordTickets`)
        .setTimestamp();

      client.channels.get(config.logChannel).send(embed);
    } else {
      client.channels.get(config.logChannel).send(`User removed to a ticket by **${message.author.tag} (${message.author.id})**`);
    }
    log.info(`${message.author.tag} removed a user to a ticket (#${message.channel})`)
  } catch(error) {
    log.error(error);
  }
    // command ends here
  },
};
