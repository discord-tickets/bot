/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

const ChildLogger = require('leekslazylogger').ChildLogger;
const log = new ChildLogger();
const Discord = require('discord.js');
const config = require('../../user/config');

module.exports = {
	name: 'stats',
	description: 'View ticket stats.',
	usage: '',
	aliases: ['data'],
	example: '',
	args: false,
	async execute(client, message, args, Ticket) {
	}
};