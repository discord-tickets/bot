/*
###############################################################################################
 ____                                        _     _____   _          _             _
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
const config = require('./config.json');
const { version, homepage } = require('./package.json');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();



const commands = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

client.once('ready', () => { // after bot has logged in
  console.log(leeks.colors.magentaBright(`
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
  console.log(leeks.colors.yellow(leeks.styles.bold(`DiscordTickets v${version} - Made By Eartharoid`)));
  console.log(leeks.colors.yellow(leeks.styles.bold(homepage)));
  console.log('');
  console.log(`Starting up...`)
  for (const file of commands) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    console.log(`> Loading '${config.prefix}${command.name}' command`);
  }
  console.log(leeks.colors.green(`Logged in as ${client.user.tag}`))
  client.user.setPresence({
      game: {
        name: config.playing
      },
      status: 'online'
    })
    // .then(console.log)
    .catch(console.error);
  // console.log(leeks.colors.green(`Set playing status as `) + leeks.colors.yellow(`'${config.playing}${config.prefix}help'`));

  if (config.useEmbeds) {
    const embed = new Discord.RichEmbed()
      .setAuthor(`${client.user.username} / Ticket Log`, client.user.avatarURL)
      .setColor("#2ECC71")
      .setDescription(":white_check_mark: **Started succesfully**")
      .setFooter(`${client.guilds.get(config.guildID).name} : DiscordTickets by Eartharoid`);
    client.channels.get(config.logChannel).send({
      embed
    })
  } else {
    client.channels.get(config.logChannel).send(":white_check_mark: **Started succesfully**")
  }
  if (client.guilds.get(config.guildID).member(client.user).hasPermission("ADMINISTRATOR", false)) {
    console.log(leeks.colors.green(`Required permissions have been granted`))
    if (config.useEmbeds) {
      const embed = new Discord.RichEmbed()
        .setAuthor(`${client.user.username} / Ticket Log`, client.user.avatarURL)
        .setColor("#2ECC71")
        .setDescription(":white_check_mark: **Required permissions have been granted**")
        .setFooter(`${client.guilds.get(config.guildID).name} : DiscordTickets by Eartharoid`);
      client.channels.get(config.logChannel).send({
        embed
      })
    } else {
      client.channels.get(config.logChannel).send(":white_check_mark: **Started succesfully**")
    }
  } else {
    console.log(leeks.colors.red(`Required permissions have not been granted`))
    console.log(leeks.colors.red(`Please give the bot the 'ADMINISTRATOR' permission`))
    if (config.useEmbeds) {
      const embed = new Discord.RichEmbed()
        .setAuthor(`${client.user.username} / Ticket Log`, client.user.avatarURL)
        .setColor("#E74C3C")
        .setDescription(":x: **Required permissions have not been granted**\nPlease give the bot the `ADMINISTRATOR` permission")
        .setFooter(`${client.guilds.get(config.guildID).name} : DiscordTickets by Eartharoid`);
      client.channels.get(config.logChannel).send({
        embed
      })
    } else {
      client.channels.get(config.logChannel).send(":white_check_mark: **Started succesfully**")
    }
  }

});

client.on('message', message => {
  // if (!message.content.startsWith(config.prefix) || message.author.bot) return;
  if (message.author.bot) return;
  if (message.channel.type === "dm") {
    if (message.author.id === client.user.id) return;
    message.channel.send(`Sorry, commands can only be used on the server.`)
    if (config.logDMs) {
      if (config.useEmbeds) {
        const embed = new Discord.RichEmbed()
          .setAuthor(`${client.user.username} / Ticket Log`, client.user.avatarURL)
          .setTitle("DM Logger")
          .addField("Username", message.author.tag, true)
          .addField("Message", message.content, true)
          .setFooter(`${client.guilds.get(config.guildID).name} : DiscordTickets by Eartharoid`);
        client.channels.get(config.logChannel).send({
          embed
        })
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

  if (command.args && !args.length) {
    let reply = `:x: **Arguments were expected but none were provided.**`;

    if (command.usage) {
      reply += `\n**Usage:** \`${config.prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  };


  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      if (config.useEmbeds) {
        const embed = new Discord.RichEmbed()
          .setAuthor(`${client.user.username}`, client.user.avatarURL)
          .setColor("#E74C3C")
          .setDescription(`:x: **Please do not spam commands** (wait ${timeLeft.toFixed(1)}s)`)
          .setFooter(`${client.guilds.get(config.guildID).name} : DiscordTickets by Eartharoid`);
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
  } catch (error) {
    console.error(error);
    message.channel.send(`:x: **Oof!** An error occured whilst executing that command.\nThe issue has been reported.`);
    console.log(leeks.colors.red(`[ERROR] An unknown error occured whilst executing '${command}' command`));
  }

});

process.on('unhandledRejection', error => {
  console.log(leeks.colors.yellow(leeks.styles.bold(`[WARN] An error was not caught`)));
  console.error(leeks.colors.red(`[ERROR] Uncaught Promise Error: \n${error.stack}`));
});
process.on('exit', (code) => {
  console.log(leeks.colors.yellow(`Disconected from Discord API`));
  console.log(leeks.colors.yellow(`Exiting (${code})`));
});

client.login(config.token);
