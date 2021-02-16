const Keyv = require('keyv');

const { homepage } = require('../../package.json');
const { path } = require('../utils/fs');

const types = {
	sqlite: 'sqlite',
	mysql: 'mysql',
	mongo: 'mongo',
	mongodb: 'mongo',
	postgre: 'postgres',
	postgres: 'postgres',
	postgresql: 'postgres',
};

const supported = Object.keys(types);

module.exports = (log) => {

	let type = (process.env.DB_TYPE || 'sqlite').toLowerCase();

	if (!supported.includes(type)) {
		log.report('Invalid database type');
		throw new Error(`DB_TYPE (${type}) is not a valid type`);
	}

	try {
		require(`@keyv/${types[type]}`);
	} catch {
		log.report('Specified database type is not installed');
		throw new Error(`"@keyv/${types[type]}" is not installed, please install is manually`);
	}

	const {
		DB_HOST,
		DB_USER,
		DB_PASS,
		DB_NAME
	} = process.env;
	let database;

	switch (type) {
	case 'mysql':
		database = `mysql://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}`;
		log.info('Using MySQL as database backend');
		break;
	case 'mongo':
	case 'mongodb':
		database = `mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}`;
		log.info('Using MongoDB as database backend');
		break;
	case 'postgre':
	case 'postgres':
	case 'postgresql':
		database = `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}`;
		log.info('Using Postgres as database backend');
		break;
	default: // sqlite
		database = `sqlite://${path('./user/database.sqlite')}`;
		log.info('Using SQLite as database backend');
		break;
	}

	return {
		servers: new Keyv(database, {
			namespace: 'servers'
		}),
		tickets: new Keyv(database, {
			namespace: 'tickets'
		}),
		messages: new Keyv(database, {
			namespace: 'messages'
		})
	};
};