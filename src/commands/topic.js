/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

const ChildLogger = require('leekslazylogger').ChildLogger;
const log = new ChildLogger();
const { MessageEmbed } = require('discord.js');
const config = require('../../user/config');

module.exports = {
	name: 'topic',
	description: 'Edit a ticket topic',
	usage: '<topic>',
	aliases: ['edit'],
	example: 'topic need help error',
	args: false,
	async execute(client, message, args, Ticket) {
		
	}
};