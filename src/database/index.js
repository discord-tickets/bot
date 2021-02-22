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
		DB_NAME,
		DB_TABLE_PREFIX
	} = process.env;

	let type = (DB_TYPE || 'sqlite').toLowerCase();

	if (!supported.includes(type)) {
		log.error(new Error(`DB_TYPE (${type}) is not a valid type`));
		return process.exit();
	}

	try {
		types[type].packages.forEach(pkg => require(pkg));
	} catch {
		let required = types[type].packages.map(i => `"${i}"`).join(' and ');
		log.error(new Error(`Please install the package(s) for your selected database type: ${required}`));
		return process.exit();
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
		return process.exit();
	}

	const Guild = sequelize.define('Guild', {
		id: {
			type: DataTypes.CHAR(18),
			primaryKey: true,
			allowNull: false,
		},
		colour: {
			type: DataTypes.STRING,
			defaultValue: config.defaults.colour
		},
		locale: {
			type: DataTypes.STRING,
			defaultValue: config.defaults.locale
		},
		log_messages: {
			type: DataTypes.BOOLEAN,
			defaultValue: config.defaults.log_messages
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'guilds'
	});


	const Ticket = sequelize.define('Ticket', {
		id: {
			type: DataTypes.CHAR(18),
			primaryKey: true,
			allowNull: false,
		},
		number: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			allowNull: false,
		},
		guild: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: Guild,
				key: 'id'
			},	
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'tickets'
	});

	// eslint-disable-next-line no-unused-vars
	const Message = sequelize.define('Message', {
		id: {
			type: DataTypes.CHAR(18),
			primaryKey: true,
			allowNull: false,
		},
		ticket: {
			type: DataTypes.STRING,
			allowNull: false,
			references: {
				model: Ticket,
				key: 'id'
			},
		},
		author: {
			type: DataTypes.CHAR(18),
			allowNull: false,
		},
		edited: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		deleted: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		updates: {
			type: DataTypes.JSON
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'messages'
	});

	sequelize.sync();

	return sequelize;
};