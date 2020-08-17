/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

require('dotenv').config({path: 'user/.env'});
const Discord = require('discord.js');
const fs = require('fs');
const leeks = require('leeks.js');
const client = new Discord.Client({
	autoReconnect: true,
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});
client.events = new Discord.Collection();
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();

require('./utils/banner')(leeks); // big coloured text thing

const config = require('../user/config');
const Logger = require('leekslazylogger');
const log = new Logger({
	name: config.name,
	logToFile: config.logs.files.enabled,
	maxAge: config.logs.files.keep_for,
	debug: config.debug
});
log.multi(log); // required to allow other files to access the logger

require('./utils/updater')(); // check for updates


/**
 * storage
 */
const { Sequelize, Model, DataTypes } = require('sequelize');

let sequelize;

if(config.storage.type === 'mysql') {
	log.info('Connecting to MySQL database...');
	sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
		dialect: 'mysql',
		host: process.env.DB_HOST,
		logging: log.debug
	});
} else {
	log.info('Using SQLite storage');
	sequelize = new Sequelize({
		dialect: 'sqlite',
		storage: 'user/storage.db',
		logging: log.debug
	});
}

class Ticket extends Model {}
Ticket.init({
	channel: DataTypes.STRING,
	creator: DataTypes.STRING,
	open: DataTypes.BOOLEAN,
	topic: DataTypes.TEXT
}, {
	sequelize,
	modelName: 'ticket'
});

class Setting extends Model {}
Setting.init({
	key: DataTypes.STRING,
	value: DataTypes.STRING,
}, {
	sequelize,
	modelName: 'setting'
});

Ticket.sync();
Setting.sync();

/**
 * event loader
 */
const events = fs.readdirSync('src/events').filter(file => file.endsWith('.js'));		
for (const file of events) {
	const event = require(`./events/${file}`);
	client.events.set(event.event, event);
	// client.on(event.event, e => client.events.get(event.event).execute(client, e, Ticket, Setting));
	client.on(event.event, (e1, e2) => client.events.get(event.event).execute(client, [e1, e2], {Ticket, Setting}));
	log.console(log.format(`> Loaded &7${event.event}&f event`));
}

/**
 * command loader
 */
const commands = fs.readdirSync('src/commands').filter(file => file.endsWith('.js'));		
for (const file of commands) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
	log.console(log.format(`> Loaded &7${config.prefix}${command.name}&f command`));
}		

log.info(`Loaded ${events.length} events and ${commands.length} commands`);

process.on('unhandledRejection', error => {
	log.warn('An error was not caught');
	log.warn(`Uncaught ${error.name}: ${error.message}`);
	log.error(error);
});

client.login(process.env.TOKEN);