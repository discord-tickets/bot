const Discord = require('discord.js');
const config = require('../config.json');
const log = require(`leekslazylogger`);
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
		let topic = args.join(" ");

  		// let num = randomString({
  		// 	length: 4,
  		// 	numeric: true,
  		// 	letters: false,
  		// 	special: false,
			// });
			let id = message.author.id.toString().substr(0,4) + message.author.discriminator;
			let chan = `ticket-${id}`;

			if(message.guild.channels.some(channel => chan.includes(channel.name))) {
				if(config.useEmbeds){
					const err1 = new Discord.RichEmbed()
						.setColor("#E74C3C")
				        .setDescription(`:x: You already have an open ticket.`)
					return message.channel.send(err1)
				} else {
					message.channel.send(`:x: You already have an open ticket.`)
				}

			};

			message.guild.createChannel(`ticket-${id}`).then(async c => {
    	c.setParent(config.ticketsCat);
    	// let supportRole = message.guild.roles.find(`id`, config.supportRole)
			let supportRole = message.guild.roles.get(config.supportRole)
    	if(!supportRole) return message.channel.send(":x: No **Support Team** role found.");


    	c.overwritePermissions(message.guild.defaultRole, {
      	VIEW_CHANNEL: false,
      	SEND_MESSAGES: false
    	})
    	c.overwritePermissions(message.member, {
      	VIEW_CHANNEL: true,
      	SEND_MESSAGES: true
    	})
    	c.overwritePermissions(supportRole, {
      	VIEW_CHANNEL: true,
      	SEND_MESSAGES: true
    	})
    	c.setTopic(`${message.author} | ${topic}`);
			if(config.tagHereOnly){
				await c.send(`@here, a user has created a new ticket.\n`);
			} else {
				await c.send(`<@&${config.supportRole}>, a user has created a new ticket.\n`);
			};

			if(config.ticketImage) {
				await c.send(`__**Here's your ticket channel, ${message.author}**__`,{files: [`./image.png`]})
			} else {
				await c.send(`__**Here's your ticket channel, ${message.author}**__`)
			}

    	const created = new Discord.RichEmbed()
    	.setColor(config.colour)
    	.setDescription(`Your ticket (${c}) has been created.\nPlease read the information sent and follow any instructions given.`)
    	.setTimestamp();
			const welcome = new Discord.RichEmbed()
    	.setColor(config.colour)
    	.setDescription(`**Ticket topic:** \`${topic}\`\n\n${config.ticketText}`)


			if(config.useEmbeds) {
    	message.channel.send(created)
			let w = await c.send(welcome)
			await w.pin();
			// c.fetchMessage(c.lastMessageID).delete()
			} else {
				message.channel.send(`Your ticket (${c}) has been created.\nPlease read the information sent and follow any instructions given.`)
				let w = await c.send(`**Ticket topic:** \`${topic}\`\n\n${config.ticketText}`)
				await w.pin()
			  // c.fetchMessage(c.lastMessageID).delete()

			}
			// log
	    if(config.useEmbeds) {
	      const embed = new Discord.RichEmbed()
	        .setAuthor(`${client.user.username} / Ticket Log`, client.user.avatarURL)
	        .setTitle("New Ticket")
					.setColor(config.colour)
					.setDescription(`\`${topic}\``)
	        .addField("Username", message.author, true)
	        .addField("Channel", c, true)
	        .setFooter(`DiscordTickets`)
					.setTimestamp();
	      client.channels.get(config.logChannel).send({embed})
	    } else {
	      client.channels.get(config.logChannel).send(`New ticket created by **${message.author.tag} (${message.author.id})**`);
	    }
			log.info(`${message.author.tag} created a new ticket (#ticket-${id})`)
  	})





    // command ends here
	},
};
