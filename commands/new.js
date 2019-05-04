const Discord = require('discord.js');
const config = require('../config.json');
const leeks = require('leeks.js');
// const randomString = require('random-string');
module.exports = {
	name: 'new',
	description: 'Create a new ticket',
	usage: '<brief description>',
	aliases: ['ticket'],
	example: 'new I found an error',
	args: true,
	cooldown: config.cooldown,
	guildOnly: true,
  execute(message, args) {
		const client = message.client;
    // command starts here
    message.delete();
    const ticketChannel = "channel";
		let topic = args.join(" ");

  		// let num = randomString({
  		// 	length: 4,
  		// 	numeric: true,
  		// 	letters: false,
  		// 	special: false,
			// });
			let id = message.author.id.toString().substr(0,4) + message.author.discriminator;

			// if(message.guild.channels.some(channel => `ticket-${id}`)) {
			if(message.guild.channels.some(includes(`ticket-${id}`))) { 
				const err1 = new Discord.RichEmbed()
						.setColor("#E74C3C")
		        .setDescription(`:x: You already have a ticket open.`)
				return message.channel.send(err1)
			};

			message.guild.createChannel(`ticket-${id}`).then(async c => {
    	c.setParent(config.ticketsCat);
    	// let supportrole = message.guild.roles.find(`id`, config.supportRole)
			let supportrole = message.guild.roles.get(config.supportRole)
    	if(!supportrole) return message.channel.send(":x: No **Support Team** role found.");


    	// c.overwritePermissions(message.guild.defaultRole, {
      // 	VIEW_CHANNEL: false,
      // 	SEND_MESSAGES: false
    	// })
    	// c.overwritePermissions(message.member, {
      // 	VIEW_CHANNEL: true,
      // 	SEND_MESSAGES: true
    	// })
    	// c.overwritePermissions(supportrole, {
      // 	VIEW_CHANNEL: true,
      // 	SEND_MESSAGES: true
    	// })
    	// c.setTopic(`${message.author} | ${topic}`);
			//
    	// const embed2 = new Discord.RichEmbed()
    	// .setColor(colour)
    	// .setDescription(`Your ticket (${c}) has been created.`)
    	// .setTimestamp()
    	// .setFooter(`${config.footer}`, config.logo);
			//
    	// message.channel.send(embed2)
    	// c.send(`<@&${config.supportRole}>\n`)
    	// c.send(embed3)
  	})


    // log
    // if(config.useEmbeds) {
    //   const embed = new Discord.RichEmbed()
    //     .setAuthor(`${client.user.username} / Ticket Log`, client.user.avatarURL)
    //     .setTitle("New Ticket")
    //     .addField("Username", message.author.tag, true)
    //     .addField("Channel", ticketChannel, true)
    //     .setFooter(`${client.guilds.get(config.guildID).name} : DiscordTickets by Eartharoid`);
    //   client.channels.get(config.logChannel).send({embed})
    // } else {
    //   client.channels.get(config.logChannel).send(`New ticket created by **${message.author.tag} (${message.author.id})**`);
    // }
		console.log(leeks.colors.cyan(`${message.author.tag} created a new ticket (#ticket-${id})`))

    // command ends here
	},
};
