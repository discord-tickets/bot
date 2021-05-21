const { DataTypes } = require('sequelize');
module.exports = (_client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('Ticket', {
		category: {
			allowNull: false,
			references: {
				key: 'id',
				model: DB_TABLE_PREFIX + 'categories'
			},
			type: DataTypes.CHAR(19)
		},
		claimed_by: {
			allowNull: true,
			type: DataTypes.CHAR(19)
		},
		closed_by: {
			allowNull: true,
			type: DataTypes.CHAR(19)
		},
		closed_reason: {
			allowNull: true,
			type: DataTypes.STRING
		},
		creator: {
			allowNull: false,
			type: DataTypes.CHAR(19)
		},
		first_response: {
			allowNull: true,
			type: DataTypes.DATE
		},
		guild: {
			allowNull: false,
			references: {
				key: 'id',
				model: DB_TABLE_PREFIX + 'guilds'
			},
			type: DataTypes.CHAR(19),
			unique: 'number-guild'
		},
		id: {
			allowNull: false,
			primaryKey: true,
			type: DataTypes.CHAR(19)
		},
		last_message: {
			allowNull: true,
			type: DataTypes.DATE
		},
		number: {
			allowNull: false,
			type: DataTypes.INTEGER,
			unique: 'number-guild'
		},
		open: {
			defaultValue: true,
			type: DataTypes.BOOLEAN
		},
		opening_message: {
			allowNull: true,
			type: DataTypes.CHAR(19)
		},
		pinned_messages: {
			defaultValue: [],
			type: DataTypes.JSON
		},
		topic: {
			allowNull: true,
			type: DataTypes.TEXT
		}
	}, { tableName: DB_TABLE_PREFIX + 'tickets' });
};