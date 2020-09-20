/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

const ChildLogger = require('leekslazylogger').ChildLogger;
const log = new ChildLogger();
const {
	MessageEmbed
} = require('discord.js');
const fs = require('fs');

module.exports = {
	name: 'delete',
	description: 'Delete a ticket. Similar to closing a ticket, but does not save transcript or archives.',
	usage: '[ticket]',
	aliases: ['del'],
	example: 'delete #ticket-17',
	args: false,
	async execute(client, message, args, {
		config,
		Ticket
	}) {

		const guild = client.guilds.cache.get(config.guild);

		const notTicket = new MessageEmbed()
			.setColor(config.err_colour)
			.setAuthor(message.author.username, message.author.displayAvatarURL())
			.setTitle(':x: **This isn\'t a ticket channel**')
			.setDescription('Use this command in the ticket channel you want to delete, or mention the channel.')
			.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
			.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
			.setFooter(guild.name, guild.iconURL());

		let ticket;
		let channel = message.mentions.channels.first();
		// || client.channels.resolve(await Ticket.findOne({ where: { id: args[0] } }).channel) // channels.fetch()

		if (!channel) {
			channel = message.channel;

			ticket = await Ticket.findOne({
				where: {
					channel: channel.id
				}
			});
			if (!ticket)
				return channel.send(notTicket);

		} else {

			ticket = await Ticket.findOne({
				where: {
					channel: channel.id
				}
			});
			if (!ticket) {
				notTicket
					.setTitle(':x: **Channel is not a ticket**')
					.setDescription(`${channel} is not a ticket channel.`);
				return message.channel.send(notTicket);
			}

			if (message.author.id !== ticket.creator && !utils.isStaff(message.member))
				return channel.send(
					new MessageEmbed()
						.setColor(config.err_colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle(':x: **No permission**')
						.setDescription(`You don't have permission to delete ${channel} as it does not belong to you and you are not staff.`)
						.addField('Usage', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
						.addField('Help', `Type \`${config.prefix}help ${this.name}\` for more information`)
						.setFooter(guild.name, guild.iconURL())
				);
		}

		let success;

		let confirm = await message.channel.send(
			new MessageEmbed()
				.setColor(config.colour)
				.setAuthor(message.author.username, message.author.displayAvatarURL())
				.setTitle(':grey_question: Are you sure?')
				.setDescription(
					`:warning: This action is **irreversible**, the ticket will be completely removed from the database.
					You will **not** be able to view a transcript/archive of the channel later.
					Use the \`close\` command instead if you don't want this behaviour.\n**React with :white_check_mark: to confirm.**`)
				.setFooter(guild.name + ' | Expires in 15 seconds', guild.iconURL())
		);

		await confirm.react('✅');

		const collector = confirm.createReactionCollector(
			(r, u) => r.emoji.name === '✅' && u.id === message.author.id, {
				time: 15000
			});

		collector.on('collect', async () => {
			if (channel.id !== message.channel.id)
				channel.send(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle('**Ticket deleted**')
						.setDescription(`Ticket deleted by ${message.author}`)
						.setFooter(guild.name, guild.iconURL())
				);

			confirm.reactions.removeAll();
			confirm.edit(
				new MessageEmbed()
					.setColor(config.colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(`:white_check_mark: **Ticket ${ticket.id} deleted**`)
					.setDescription('The channel will be automatically deleted in a few seconds.')
					.setFooter(guild.name, guild.iconURL())
			);

			let txt = `user/transcripts/text/${ticket.get('channel')}.txt`,
				raw = `user/transcripts/raw/${ticket.get('channel')}.log`,
				json = `user/transcripts/raw/entities/${ticket.get('channel')}.json`;

			if (fs.existsSync(txt)) 
				fs.unlinkSync(txt);

			if (fs.existsSync(raw)) 
				fs.unlinkSync(raw);

			if (fs.existsSync(json)) 
				fs.unlinkSync(json);

			// update database
			success = true;
			ticket.destroy(); // remove ticket from database

			// delete messages and channel
			setTimeout(() => {
				channel.delete();
				if (channel.id !== message.channel.id)
					message.delete()
						.then(() => confirm.delete());
			}, 5000);

			log.info(`${message.author.tag} deleted a ticket (#ticket-${ticket.id})`);

			if (config.logs.discord.enabled)
				client.channels.cache.get(config.logs.discord.channel).send(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle('Ticket deleted')
						.addField('Creator', `<@${ticket.creator}>`, true)
						.addField('Deleted by', message.author, true)
						.setFooter(guild.name, guild.iconURL())
						.setTimestamp()
				);
		});


		collector.on('end', () => {
			if (!success) {
				confirm.reactions.removeAll();
				confirm.edit(
					new MessageEmbed()
						.setColor(config.err_colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle(':x: **Expired**')
						.setDescription('You took too long to react; confirmation failed.')
						.setFooter(guild.name, guild.iconURL()));

				message.delete({
					timeout: 10000
				})
					.then(() => confirm.delete());
			}
		});

	}
};