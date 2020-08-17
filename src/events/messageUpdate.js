/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

const Discord = require('discord.js');
const ChildLogger = require('leekslazylogger').ChildLogger;
const log = new ChildLogger();
const config = require('../../user/config');
const fs = require('fs');
const dtf = require('@eartharoid/dtf');

module.exports = {
	event: 'messageUpdate',
	async execute(client, [o, n], {Ticket, Setting}) {
		/**
		 * CHECK IF O === N
		 */
		console.log(o.author.tag);
		// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-messageUpdate
		// append new to raw

	}
};