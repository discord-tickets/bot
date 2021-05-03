const { DataTypes } = require('sequelize');
module.exports = (client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('Ticket', {
		id: {
			type: DataTypes.CHAR(19),
			primaryKey: true,
			allowNull: false,
		},
		category: {
			type: DataTypes.CHAR(19),
			allowNull: false,
			references: {
				model: DB_TABLE_PREFIX + 'categories',
				key: 'id'
			},
		},
		claimed_by: {
			type: DataTypes.CHAR(19),
			allowNull: true,
		},
		closed_by: {
			type: DataTypes.CHAR(19),
			allowNull: true,
		},
		closed_reason: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		creator: {
			type: DataTypes.CHAR(19),
			allowNull: false,
		},
		first_response: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		guild: {
			type: DataTypes.CHAR(19),
			allowNull: false,
			references: {
				model: DB_TABLE_PREFIX + 'guilds',
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
		opening_message: {
			type: DataTypes.CHAR(19),
			allowNull: true,
		},
		pinned_messages: {
			type: DataTypes.JSON,
			defaultValue: []
		},
		topic: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'tickets'
	});
};