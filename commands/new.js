const Discord = require('discord.js');
const config = require('../config.json');
module.exports = {
	name: 'new',
	description: 'Create a new ticket',
	usage: '<brief description>',
	aliases: ['ticket'],
	example: 'new I found an error',
	args: true,
	cooldown: config.cooldown,
	execute(message, args) {
    // command starts here
    message.delete();
    const ticketChannel = "channel";

    // log
    if(config.useEmbeds) {
      const embed = new Discord.RichEmbed()
        .setAuthor(`${client.user.username} / Ticket Log`, client.user.avatarURL)
        .setTitle("New Ticket")
        .addField("Username", message.author.tag, true)
        .addField("Channel", ticketChannel, true)
        .setFooter(`${client.guilds.get(config.guildID).name} : DiscordTickets by Eartharoid`);
      client.channels.get(config.logChannel).send({embed})
    } else {
      client.channels.get(config.logChannel).send(`New ticket created by **${message.author.tag} (${message.author.id})**`);
    }


    // command ends here
	},
};
