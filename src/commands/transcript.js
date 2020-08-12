/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

const Discord = require('discord.js');
const fs = require('fs');
const config = require('../../user/config');

module.exports = {
	name: 'transcript',
	description: 'Download a transcript',
	usage: '<ticket-id>',
	aliases: ['archive', 'download'],
	example: 'transcript 57',
	args: false,
	async execute(client, message, args, Ticket) {
		/** @TODO TRY TO SEND ATTACHMENT TO DM */
	}
};