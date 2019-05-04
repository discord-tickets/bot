const Discord = require('discord.js');
const config = require('../config.json');
module.exports = {
  name: 'close',
  description: 'Close a ticket',
  usage: '',
  aliases: ['none'],
  example: '',
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
