/*
###############################################################################################
 ____                                        _     _____              _             _
|  _ \  (_)  ___    ___    ___    _ __    __| |   |_   _| (_)   ___  | | __   ___  | |_   ___
| | | | | | / __|  / __|  / _ \  | '__|  / _` |     | |   | |  / __| | |/ /  / _ \ | __| / __|
| |_| | | | \__ \ | (__  | (_) | | |    | (_| |     | |   | | | (__  |   <  |  __/ | |_  \__ \
|____/  |_| |___/  \___|  \___/  |_|     \__,_|     |_|   |_|  \___| |_|\_\  \___|  \__| |___/

===============================================================================================

---------------------
   Discord Tickets
---------------------

  A bot created by Eartharoid for the Discord (TM) platform. [GNU-GPLv3.0]

  > The bot manages user-created support tickets to allow your support team to provide quicker
    and better assistance to your community members.

---------------------
     Quick Start
---------------------

  > For detailed instructions, visit the github repository and read the documentation.

  > Assuming you have created discord application, edit 'config.json' to allow the bot to
    function correctly.

  > You will need your bot token (keep it a secret) and channel & role IDs from your server

  > It is recommended that you do not change much / anything in any of the .js files unless
    you know what you are doing, to prevent critical errors from occuring.

===============================================================================================

  > For support, visit https://github.com/eartharoid/DiscordTickets/#readme
  > My website: https://eartharoid.ml

###############################################################################################
*/
const fs = require('fs');
const Discord = require('discord.js');
const leeks = require('leeks.js');
const log = require(`./handlers/logger.js`);
const config = require('./config.json');
const { version, homepage } = require('./package.json');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const now = Date.now();

const commands = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
console.log(leeks.colours.magentaBright(`
########  ####  ######   ######   #######  ########  ########
##     ##  ##  ##    ## ##    ## ##     ## ##     ## ##     ##
##     ##  ##  ##       ##       ##     ## ##     ## ##     ##
##     ##  ##   ######  ##       ##     ## ########  ##     ##
##     ##  ##        ## ##       ##     ## ##   ##   ##     ##
##     ##  ##  ##    ## ##    ## ##     ## ##    ##  ##     ##
########  ####  ######   ######   #######  ##     ## ########

######## ####  ######  ##    ## ######## ########  ######
   ##     ##  ##    ## ##   ##  ##          ##    ##    ##
   ##     ##  ##       ##  ##   ##          ##    ##
   ##     ##  ##       #####    ######      ##     ######
   ##     ##  ##       ##  ##   ##          ##          ##
   ##     ##  ##    ## ##   ##  ##          ##    ##    ##
   ##    ####  ######  ##    ## ########    ##     ######

  `)); // banner appears in console
console.log(leeks.colours.yellow(leeks.styles.bold(`DiscordTickets v${version} - Made By Eartharoid`)));
console.log(leeks.colours.yellow(leeks.styles.bold(homepage)));
console.log('\n\n');
console.log(leeks.colours.bgGrey(leeks.colours.grey(`\n\n==========================================================================\n\n`)))
console.log('\n\n');
log.init()
log.info(`Starting up...`)


client.once('ready', () => { // after bot has logged in

  log.info(`Initialising bot...`)
  for (const file of commands) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    log.console(`> Loading '${config.prefix}${command.name}' command`);
  }
  log.success(`Connected to Discord API`)
  log.success(`Logged in as ${client.user.tag}`)
  client.user.setPresence({game: {name: config.playing, type: config.activityType},status: config.status})
    // .then(log.basic)
    .catch(log.error);

  if (config.useEmbeds) {
    const embed = new Discord.RichEmbed()
      .setAuthor(`${client.user.username} / Ticket Log`, client.user.avatarURL)
      .setColor("#2ECC71")
      .setDescription(":white_check_mark: **Started succesfully**")
      .setFooter(`DiscordTickets by Eartharoid`);
    client.channels.get(config.logChannel).send(embed)
  } else {
    client.channels.get(config.logChannel).send(":white_check_mark: **Started succesfully**")
  }
  if (client.guilds.get(config.guildID).member(client.user).hasPermission("ADMINISTRATOR", false)) {
    log.info(`Checking permissions...`);
    setTimeout(function() {
      log.success(`Required permissions have been granted\n\n`)
    }, 1250);

    if (config.useEmbeds) {
      const embed = new Discord.RichEmbed()
        .setAuthor(`${client.user.username} / Ticket Log`, client.user.avatarURL)
        .setColor("#2ECC71")
        .setDescription(":white_check_mark: **Required permissions have been granted**")
        .setFooter(`DiscordTickets by Eartharoid`);
      client.channels.get(config.logChannel).send(embed)
    } else {
      client.channels.get(config.logChannel).send(":white_check_mark: **Started succesfully**")
    }
  } else {
    log.error(`Required permissions have not been granted`)
    log.error(`Please give the bot the 'ADMINISTRATOR' permission\n\n`)
    if (config.useEmbeds) {
      const embed = new Discord.RichEmbed()
        .setAuthor(`${client.user.username} / Ticket Log`, client.user.avatarURL)
        .setColor("#E74C3C")
        .setDescription(":x: **Required permissions have not been granted**\nPlease give the bot the `ADMINISTRATOR` permission")
        .setFooter(`DiscordTickets by Eartharoid`);
      client.channels.get(config.logChannel).send({
        embed
      })
    } else {
      client.channels.get(config.logChannel).send(":white_check_mark: **Started succesfully**")
    }
  }

});

client.on('message', async message => {
  // if (!message.content.startsWith(config.prefix) || message.author.bot) return;
  if (message.author.bot) return;
  if (message.channel.type === "dm") {
    if (message.author.id === client.user.id) return;
    // message.channel.send(`Sorry, commands can only be used on the server.`)
    if (config.logDMs) {
      if (config.useEmbeds) {
        const embed = new Discord.RichEmbed()
          .setAuthor(`${client.user.username} / Ticket Log`, client.user.avatarURL)
          .setTitle("DM Logger")
          .addField("Username", message.author.tag, true)
          .addField("Message", message.content, true)
          .setFooter(`DiscordTickets by Eartharoid`);
        client.channels.get(config.logChannel).send(embed)
      } else {
        client.channels.get(config.logChannel).send(`DM received from **${message.author.tag} (${message.author.id})** : \n\n\`\`\`${message.content}\`\`\``);
      }
    } else {
      return
    };

  }
  if (message.channel.bot) return;

  // const args = message.content.slice(config.prefix.length).split(/ +/);


  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|\\${config.prefix})\\s*`);
  if (!prefixRegex.test(message.content)) return;
  const [, matchedPrefix] = message.content.match(prefixRegex);
  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  // if (!client.commands.has(commandName)) return;
  // const command = client.commands.get(commandName);
  const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

  if (command.guildOnly && message.channel.type !== 'text') {
	   return message.channel.send(`Sorry, this command can only be used on the server.`)
  }

  if (command.args && !args.length) {
    // let reply = `:x: **Arguments were expected but none were provided.**`;
    //
    // if (command.usage) {
    //   reply += `\n**Usage:** \`${config.prefix}${command.name} ${command.usage}\``;
    // }
    //
    // return message.channel.send(reply);
    if (config.useEmbeds) {
        const embed = new Discord.RichEmbed()
          .setColor("#E74C3C")
          .setDescription(`\n**Usage:** \`${config.prefix}${command.name} ${command.usage}\`\nType \`${config.prefix}help ${command.name}\` for more information`)
        return message.channel.send({embed})

    } else {
      return message.channel.send(`**Usage:** \`${config.prefix}${command.name} ${command.usage}\`\nType \`${config.prefix}help ${command.name}\` for more information`)
    }
  };


  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      if (config.useEmbeds) {
        const embed = new Discord.RichEmbed()
          .setColor("#E74C3C")
          .setDescription(`:x: **Please do not spam commands** (wait ${timeLeft.toFixed(1)}s)`)
        return message.channel.send({embed})
      } else {
        return message.reply(`please do not spam commands (wait ${timeLeft.toFixed(1)}s)`);
      }

    }
  }
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);


  try {
    // client.commands.get(command).execute(message, args, config);
    command.execute(message, args);
    if(config.useEmbeds) {
      const embed = new Discord.RichEmbed()
        .setAuthor(`${client.user.username} / Command Log`, client.user.avatarURL)
        .setTitle("Command Used")
        .addField("Username", message.author, true)
        .addField("Command", command.name, true)
        .setFooter(`DiscordTickets`)
        .setTimestamp();
      client.channels.get(config.logChannel).send({embed})
    } else {
      client.channels.get(config.logChannel).send(`**${message.author.tag} (${message.author.id})** used the \`${command.name}\` command`);
    }
    log.console(`${message.author.tag} used the '${command.name}' command`)
  } catch (error) {
    log.error(error);
    message.channel.send(`:x: **Oof!** An error occured whilst executing that command.\nThe issue has been reported.`);
    log.error(`An unknown error occured whilst executing the '${command.name}' command`);
  }

});
client.on('error', error => {
  log.warn(`Potential error detected\n(likely Discord API connection issue)\n`);
  log.error(`Client error:\n${error}`);
});
client.on('warn', (e) => log.warn(`${e}`));

if(config.debugLevel == 1){ client.on('debug', (e) => log.debug(`${e}`)) };

process.on('unhandledRejection', error => {
  log.warn(`An error was not caught`);
  log.error(`Uncaught error: \n${error.stack}`);
});
process.on('beforeExit', (code) => {
  log.basic(leeks.colours.yellowBright(`Disconected from Discord API`));
  log.basic(`Exiting (${code})`);
});

client.login(config.token);
