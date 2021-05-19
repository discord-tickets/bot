/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

const fs = require('fs');
const { join } = require('path');

const {
	MessageEmbed
} = require('discord.js');

module.exports = {
	name: 'transcript',
	description: 'Download a transcript',
	usage: '<interview-{u.username}>',
	aliases: ['archive', 'download'],
	example: 'interview-beyondboy',
	args: true,
	async execute(client, message, args, _log, { config, Ticket }) {
		const guild = client.guilds.cache.get(config.guild);
		const id = args[0];

		let ticket = await Ticket.findOne({
			where: {
				id: id,
				open: true
			}
		});


		if (!ticket) {
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **Unknown interview**')
					.setDescription('Couldn\'t find a closed interview with that ID')
					.setFooter(guild.name, guild.iconURL())
			);
		}

		if (message.author.id !== ticket.creator && !message.member.roles.cache.has(config.staff_role)) {
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('❌ **No permission**')
					.setDescription(`You don't have permission to view interview ${u.username} as it does not belong to you and you are not staff.`)
					.setFooter(guild.name, guild.iconURL())
			);
		}

		let res = {};
		const embed = new MessageEmbed()
			.setColor(config.colour)
			.setAuthor(message.author.username, message.author.displayAvatarURL())
			.setTitle(`Interview ${u.username}`)
			.setFooter(guild.name, guild.iconURL());
		
		
			let msgs = messageCollection.array().reverse();
			let data = await fs.readFile('user\transcripts\html\template.html', 'utf8')
				.then(console.log(`Successfully read: template.html`))
				.catch(err => console.log(err));
			if (data) {
				await fs.writeFile(`./html/${filename}`, data)
					.then(console.log(`Successfully wrote: ${filename}`))
					.catch(err => console.log(err));
				let guildElement = document.createElement('div');
				let guildText = document.createTextNode(message.guild.name);
				let guildImg = document.createElement('img');
				guildImg.setAttribute('src', message.guild.iconURL());
				guildImg.setAttribute('width', '150');
				guildElement.appendChild(guildImg);
				guildElement.appendChild(guildText);
				console.log(guildElement.outerHTML);
				await fs.appendFile(`./html/${filename}`, guildElement.outerHTML)
					.catch(err => console.log(err));
	
				msgs.forEach(async msg => {
					let parentContainer = document.createElement("div");
					parentContainer.className = "parent-container";
	
					let avatarDiv = document.createElement("div");
					avatarDiv.className = "avatar-container";
					let img = document.createElement('img');
					img.setAttribute('src', msg.author.displayAvatarURL());
					img.className = "avatar";
					avatarDiv.appendChild(img);
	
					parentContainer.appendChild(avatarDiv);
	
					let messageContainer = document.createElement('div');
					messageContainer.className = "message-container";
	
					let nameElement = document.createElement("span");
					let name = document.createTextNode(msg.author.tag + " " + msg.createdAt.toDateString() + " " + msg.createdAt.toLocaleTimeString() + " EST");
					nameElement.appendChild(name);
					messageContainer.append(nameElement);
	
					if (msg.content.startsWith("```")) {
						let m = msg.content.replace(/```/g, "");
						let codeNode = document.createElement("code");
						let textNode = document.createTextNode(m);
						codeNode.appendChild(textNode);
						messageContainer.appendChild(codeNode);
					}
					else {
						let msgNode = document.createElement('span');
						let textNode = document.createTextNode(msg.content);
						msgNode.append(textNode);
						messageContainer.appendChild(msgNode);
					}
					parentContainer.appendChild(messageContainer);
					await fs.appendFile(`./html/${filename}`, parentContainer.outerHTML)
						.catch(err => console.log(err));
				});
			} else {
				console.log(`No data!`);
			}

		if (embed.fields.length < 1) embed.setDescription(`No text transcripts or archive data exists for interview ${u.username}`);

		res.embed = embed;

		let channel;
		try {
			channel = message.author.dmChannel || await message.author.createDM();
		} catch (e) {
			channel = message.channel;
		}

		
		let att = new discord.MessageAttachment(`./html/${filename}`);
			await message.channel.send(`Please see included file!`, att);
			fs.unlink(`./html/${filename}`);
			
			
		channel.send(res).then(m => {
			if (channel.id === message.channel.id) m.delete({timeout: 15000});
		});
		message.delete({timeout: 1500});
	}
};