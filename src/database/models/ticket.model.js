const { DataTypes } = require('sequelize');
module.exports = (client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('Ticket', {
		id: {
			type: DataTypes.CHAR(18),
			primaryKey: true,
			allowNull: false,
		},
		category: {
			type: DataTypes.CHAR(18),
			allowNull: false,
			references: {
				model: DB_TABLE_PREFIX + 'categories',
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
		first_response: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		guild: {
			type: DataTypes.CHAR(18),
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
		topic: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'tickets'
	});
};