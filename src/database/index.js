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
		locale: {
			type: DataTypes.STRING,
			defaultValue: config.locale
		},
		command_prefix: {
			type: DataTypes.STRING,
			defaultValue: config.defaults.command_prefix
		},
		colour: {
			type: DataTypes.STRING,
			defaultValue: config.defaults.colour
		},
		success_colour: {
			type: DataTypes.STRING,
			defaultValue: 'GREEN'
		},
		error_colour: {
			type: DataTypes.STRING,
			defaultValue: 'RED'
		},
		log_messages: {
			type: DataTypes.BOOLEAN,
			defaultValue: config.defaults.log_messages
		},
		footer: {
			type: DataTypes.STRING,
			defaultValue: 'Discord Tickets by eartharoid'
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
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: 'name-guild'
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
		roles: {
			type: DataTypes.JSON
		},
		max_per_member: {
			type: DataTypes.INTEGER,
			defaultValue: 1
		},
		name_format: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: config.defaults.name_format
		}
	}, {
		tableName: DB_TABLE_PREFIX + 'categories'
	});

	const Ticket = sequelize.define('Ticket', {
		id: {
			type: DataTypes.CHAR(18),
			primaryKey: true,
			allowNull: false,
		},
		number: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: 'number-guild'
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
		category: {
			type: DataTypes.CHAR(18),
			allowNull: false,
			references: {
				model: Category,
				key: 'id'
			},
		},
		topic: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		creator: {
			type: DataTypes.CHAR(18),
			allowNull: false,
		},
		open: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		},
		closed_by: {
			type: DataTypes.CHAR(18),
			allowNull: true,
		}
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
			type: DataTypes.CHAR(18),
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
		data: {
			type: DataTypes.JSON
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'messages'
	});

	// eslint-disable-next-line no-unused-vars
	const UserEntity = sequelize.define('UserEntity', {
		user: {
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
		avatar: DataTypes.STRING,
		username: DataTypes.STRING,
		discriminator: DataTypes.STRING,
		display_name: DataTypes.STRING,
		colour: DataTypes.CHAR(6),
		bot: DataTypes.BOOLEAN
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
		ticket: {
			type: DataTypes.CHAR(18),
			allowNull: false,
			unique: 'id-ticket',
			references: {
				model: Ticket,
				key: 'id'
			},
		},
		name: DataTypes.STRING,
	}, {
		tableName: DB_TABLE_PREFIX + 'channel_entities'
	});

	// eslint-disable-next-line no-unused-vars
	const RoleEntity = sequelize.define('RoleEntity', {
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
		name: DataTypes.STRING,
		colour: DataTypes.CHAR(6),
	}, {
		tableName: DB_TABLE_PREFIX + 'role_entities'
	});

	sequelize.sync();

	return sequelize;
};