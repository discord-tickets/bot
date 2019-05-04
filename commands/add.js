const Discord = require('discord.js');
const config = require('../config.json');
const leeks = require('leeks.js');
module.exports = {
  name: 'add',
  description: 'Add a member to a ticket channel',
  usage: '<@member>',
  aliases: ['adduser'],
  example: 'add @exampleUser',
  args: false,
  cooldown: config.cooldown,
  guildOnly: true,
  execute(message, args) {
    const client = message.client;
    // command starts here
    message.delete();




    // command ends here
  },
};
