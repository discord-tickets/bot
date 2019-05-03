const Discord = require('discord.js');
module.exports = {
	name: 'help',
	description: 'Displays help menu',
  usage: 'help [command]',
	aliases: ['command', 'commands'],
	execute(message, args, config, version) {
		const client = message.client;
    // command starts here
    message.delete();
		if(config.useEmbeds) {
      const embed = new Discord.RichEmbed()
        .setAuthor(`${client.user.username} / Commands`, client.user.avatarURL)
				.setColor(config.colour)
        .addField("...", `...`, true)
        .addField("...", `...`, true)
        .setFooter(`${client.guilds.get(config.guildID).name} : DiscordTickets by Eartharoid`);
      message.channel.send({embed})
    } else {
      message.channel.send(`**Prefix =** \`${config.prefix}\`\n**Bot Version =** \`${version}\``)
    }


    // command ends here
	},
};
