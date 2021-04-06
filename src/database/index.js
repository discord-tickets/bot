const { 
	Sequelize,
	DataTypes
} = require('sequelize');
const { path } = require('../utils/fs');
const config = require('../../user/config');
const types = require('./dialects');

module.exports = async (client) => {

	const {
		DB_TYPE,
		DB_HOST,
		DB_PORT,
		DB_USER,
		DB_PASS,
		DB_NAME,
		DB_TABLE_PREFIX
	} = process.env;

	let type = (DB_TYPE || 'sqlite').toLowerCase();

	const supported = Object.keys(types);
	if (!supported.includes(type)) {
		client.log.error(new Error(`DB_TYPE (${type}) is not a valid type`));
		return process.exit();
	}

	try {
		types[type].packages.forEach(pkg => require(pkg));
	} catch {
		let required = types[type].packages.map(i => `"${i}"`).join(' and ');
		client.log.error(new Error(`Please install the package(s) for your selected database type: ${required}`));
		return process.exit();
	}

	let sequelize;

	if (type === 'sqlite') {
		client.log.info('Using SQLite storage');
		sequelize = new Sequelize({
			dialect: types[type].dialect,
			storage: path('./user/database.sqlite'),
			logging: text => client.log.debug(text)
		});
	} else {
		client.log.info(`Connecting to ${types[type].name} database...`);
		sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
			dialect: types[type].dialect,
			host: DB_HOST,
			port: DB_PORT,
			logging: text => client.log.debug(text)
		});
	}

	try {
		await sequelize.authenticate();
		client.log.success('Connected to database successfully');
	} catch (error) {
		client.log.warn('Failed to connect to database');
		client.log.error(error);
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
		command_prefix: {
			type: DataTypes.STRING,
			defaultValue: config.defaults.command_prefix
		},
		error_colour: {
			type: DataTypes.STRING,
			defaultValue: 'RED'
		},
		footer: {
			type: DataTypes.STRING,
			defaultValue: 'Discord Tickets by eartharoid'
		},
		locale: {
			type: DataTypes.STRING,
			defaultValue: config.locale
		},
		log_messages: {
			type: DataTypes.BOOLEAN,
			defaultValue: config.defaults.log_messages
		},
		success_colour: {
			type: DataTypes.STRING,
			defaultValue: 'GREEN'
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'guilds'
	});

	const Category = sequelize.define('Category', {
		id: {
			type: DataTypes.CHAR(18),
			primaryKey: true,
			allowNull: false,
		},
		guild: {
			type: DataTypes.CHAR(18),
			allowNull: false,
			references: {
				model: Guild,
				key: 'id'
			},
			unique: 'name-guild'
		},
		max_per_member: {
			type: DataTypes.INTEGER,
			defaultValue: 1
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: 'name-guild'
		},
		name_format: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: config.defaults.name_format
		},
		opening_message: {
			type: DataTypes.STRING,
			defaultValue: config.defaults.opening_message,
		},
		require_topic: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
		roles: {
			type: DataTypes.JSON,
			allowNull: false,
		},
		questions: {
			type: DataTypes.JSON,
			allowNull: true,
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'categories'
	});

	const Ticket = sequelize.define('Ticket', {
		id: {
			type: DataTypes.CHAR(18),
			primaryKey: true,
			allowNull: false,
		},
		category: {
			type: DataTypes.CHAR(18),
			allowNull: false,
			references: {
				model: Category,
				key: 'id'
			},
		},
		closed_by: {
			type: DataTypes.CHAR(18),
			allowNull: true,
		},
		creator: {
			type: DataTypes.CHAR(18),
			allowNull: false,
		},
		guild: {
			type: DataTypes.CHAR(18),
			allowNull: false,
			references: {
				model: Guild,
				key: 'id'
			},
			unique: 'number-guild'
		},
		number: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: 'number-guild'
		},
		open: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		},
		topic: {
			type: DataTypes.STRING,
			allowNull: true,
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
		author: {
			type: DataTypes.CHAR(18),
			allowNull: false,
		},
		data: {
			type: DataTypes.JSON,
			allowNull: false,
		},
		deleted: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		edited: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		ticket: {
			type: DataTypes.CHAR(18),
			allowNull: false,
			references: {
				model: Ticket,
				key: 'id'
			},
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'messages'
	});

	// eslint-disable-next-line no-unused-vars
	const UserEntity = sequelize.define('UserEntity', {
		avatar: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		bot: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		colour: {
			type: DataTypes.CHAR(6),
			allowNull: true,
		},
		discriminator: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		display_name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		ticket: {
			type: DataTypes.CHAR(18),
			allowNull: false,
			unique: 'id-ticket',
			references: {
				model: Ticket,
				key: 'id'
			},
		},
		user: {
			type: DataTypes.CHAR(18),
			allowNull: false,
			unique: 'id-ticket'
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'user_entities'
	});

	// eslint-disable-next-line no-unused-vars
	const ChannelEntity = sequelize.define('ChannelEntity', {
		channel: {
			type: DataTypes.CHAR(18),
			allowNull: false,
			unique: 'id-ticket'
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		ticket: {
			type: DataTypes.CHAR(18),
			allowNull: false,
			unique: 'id-ticket',
			references: {
				model: Ticket,
				key: 'id'
			},
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'channel_entities'
	});

	// eslint-disable-next-line no-unused-vars
	const RoleEntity = sequelize.define('RoleEntity', {
		colour: {
			type: DataTypes.CHAR(6),
			defaultValue: '7289DA',
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		role: {
			type: DataTypes.CHAR(18),
			allowNull: false,
			unique: 'id-ticket'
		},
		ticket: {
			type: DataTypes.CHAR(18),
			allowNull: false,
			unique: 'id-ticket',
			references: {
				model: Ticket,
				key: 'id'
			},
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'role_entities'
	});

	sequelize.sync();

	return sequelize;
};