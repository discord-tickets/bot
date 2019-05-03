module.exports = {
	name: 'new',
	description: 'Create a new ticket',
  usage: 'new [brief description]',
	execute(message, args, config) {
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
