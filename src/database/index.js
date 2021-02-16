const { 
	Sequelize,
	DataTypes
} = require('sequelize');
const { path } = require('../utils/fs');
const config = require('../../user/config');
const types = require('./dialects');
const supported = Object.keys(types);

module.exports = async (log) => {

	const {
		DB_TYPE,
		DB_HOST,
		DB_USER,
		DB_PASS,
		DB_NAME
	} = process.env;

	let type = (DB_TYPE || 'sqlite').toLowerCase();

	if (!supported.includes(type)) {
		log.report('Invalid database type');
		throw new Error(`DB_TYPE (${type}) is not a valid type`);
	}

	try {
		types[type].packages.forEach(pkg => require(pkg));
	} catch {
		log.report('Specified database type is not installed');
		let required = types[type].packages.map(i => `"${i}"`).join(' and ');
		throw new Error(`Please install the package(s) for your selected database type: ${required}`);
	}

	let sequelize;

	if (type === 'sqlite') {
		log.info('Using SQLite storage');
		sequelize = new Sequelize({
			dialect: types[type].dialect,
			storage: path('./user/database.sqlite'),
			logging: log.debug
		});
	} else {
		log.info(`Connecting to ${types[type].name} database...`);
		sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
			dialect: types[type].dialect,
			host: DB_HOST,
			logging: log.debug
		});
	}

	try {
		await sequelize.authenticate();
		log.success('Connected to database successfully');
	} catch (error) {
		log.warn('Unable to connect to database');
		log.error(error);
	}

	/* let models = {};
	let files = fs.readdirSync(path('src/database/models/')).filter(file => file.endsWith('.js'));

	for (let file of files) {
		let table = require(`./models/${file}`);
		let model = sequelize.define(table.name, table.model);
		models[table.name] = model;
	} */

	const Guild = sequelize.define('Guild', {
		id: {
			type: DataTypes.CHAR(18),
			primaryKey: true
		},
		prefix: {
			type: DataTypes.STRING, // STRING(255) = VARCHAR(255)
			defaultValue: config.defaults.prefix
		},
		locale: {
			type: DataTypes.STRING,
			defaultValue: config.defaults.locale
		}
	}, {
		tableName: 'guilds'
	});


	const Ticket = sequelize.define('Ticket', {
		id: {
			type: DataTypes.CHAR(18),
			primaryKey: true
		},
		guild: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: Guild,
				key: 'id'
			},	
		}
	}, {
		tableName: 'tickets'
	});

	// eslint-disable-next-line no-unused-vars
	const Message = sequelize.define('Message', {
		id: {
			type: DataTypes.CHAR(18),
			primaryKey: true
		},
		ticket: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: Ticket,
				key: 'id'
			},
		}
	}, {
		tableName: 'messages'
	});

	sequelize.sync();

	return sequelize.models;
};