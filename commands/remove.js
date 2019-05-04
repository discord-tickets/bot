const Discord = require('discord.js');
const config = require('../config.json');
module.exports = {
  name: 'remove',
  description: 'Remove a member from a ticket',
  usage: '<@member>',
  aliases: ['kick'],
  example: 'remove @exampleUser',
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
