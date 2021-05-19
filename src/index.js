/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 * DiscordTickets  Copyright (C) 2020  Isaac "eartharoid" Saunders
 * This program comes with ABSOLUTELY NO WARRANTY.
 * This is free software, and you are welcome to redistribute it
 * under certain conditions. See the included LICENSE file for details.
 *
 */

const version = Number(process.version.split('.')[0].replace('v', ''));
if (version < 12) return console.log('Please upgrade to Node v12 or higher');

const fs = require('fs');
const { join } = require('path');

let dev = fs.existsSync(join(__dirname, '../user/dev.env')) && fs.existsSync(join(__dirname, '../user/dev.config.js'));

require('dotenv').config({ path: join(__dirname, '../user/', dev ? 'dev.env' : '.env') });

module.exports.config = dev ? 'dev.config.js' : 'config.js';
const config = require(join(__dirname, '../user/', module.exports.config));

const Discord = require('discord.js');
const client = new Discord.Client({
	autoReconnect: true,
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client.events = new Discord.Collection();
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();

const utils = require('./modules/utils');
const leeks = require('leeks.js');

require('./modules/banner')(leeks); // big coloured text thing

const Logger = require('leekslazylogger');
const log = new Logger({
	name: config.name,
	logToFile: config.logs.files.enabled,
	maxAge: config.logs.files.keep_for,
	debug: config.debug
});

require('./modules/updater')(); // check for updates

/**
 * storage
 */
const { Sequelize, Model, DataTypes } = require('sequelize');

let sequelize;

switch (config.storage.type) {
case 'mysql':
	log.info('Connecting to MySQL database...');
	sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
		dialect: 'mysql',
		host: process.env.DB_HOST,
		logging: log.debug
	});
	break;
case 'mariadb':
	log.info('Connecting to MariaDB database...');
	sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
		dialect: 'mariadb',
		host: process.env.DB_HOST,
		logging: log.debug
	});
	break;
case 'postgre':
	log.info('Connecting to PostgreSQL database...');
	sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
		dialect: 'postgres',
		host: process.env.DB_HOST,
		logging: log.debug
	});
	break;
case 'microsoft':
	log.info('Connecting to Microsoft SQL Server database...');
	sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
		dialect: 'mssql',
		host: process.env.DB_HOST,
		logging: log.debug
	});
	break;
default:
	log.info('Using SQLite storage');
	sequelize = new Sequelize({
		dialect: 'sqlite',
		storage: join(__dirname, '../user/storage.db'),
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
const events = fs.readdirSync(join(__dirname, 'events')).filter(file => file.endsWith('.js'));
for (const file of events) {
	const event = require(`./events/${file}`);
	client.events.set(event.event, event);
	// client.on(event.event, e => client.events.get(event.event).execute(client, e, Ticket, Setting));
	client.on(event.event, (e1, e2) => client.events.get(event.event).execute(client, log, [e1, e2], {config, Ticket, Setting}));
	log.console(log.format(`> Loaded &7${event.event}&f event`));
}

/**
 * command loader
 */
const commands = fs.readdirSync(join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commands) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
	log.console(log.format(`> Loaded &7${config.prefix}${command.name}&f command`));
}

log.info(`Loaded ${events.length} events and ${commands.length} commands`);

const one_day = 1000 * 60 * 60 * 24;
const html = '../user/transcripts/html';
const clean = () => {
	const files = fs.readdirSync(join(__dirname, html)).filter(file => file.endsWith('.html'));
	let total = 0;
	for (const file of files) {
		let diff = (new Date() - new Date(fs.statSync(join(__dirname, html, file)).mtime));
		if (Math.floor(diff / one_day) > config.transcripts.html.keep_for) {
			fs.unlinkSync(join(__dirname, html, file));
			total++;
		}
	}
	if (total > 0) log.info(`Deleted ${total} old text ${utils.plural('transcript', total)}`);
};

if (config.transcripts.html.enabled) {
	clean();
	setInterval(clean, one_day);
}

process.on('unhandledRejection', error => {
	log.warn('An error was not caught');
	log.warn(`Uncaught ${error.name}: ${error.message}`);
	log.error(error);
});

client.login(process.env.TOKEN);
