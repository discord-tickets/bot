const { DataTypes } = require('sequelize');
module.exports = (client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('Message', {
		id: {
			type: DataTypes.CHAR(19),
			primaryKey: true,
			allowNull: false,
		},
		author: {
			type: DataTypes.CHAR(19),
			allowNull: false,
		},
		data: {
			type: DataTypes.TEXT,
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
			type: DataTypes.CHAR(19),
			allowNull: false,
			references: {
				model: DB_TABLE_PREFIX + 'tickets',
				key: 'id'
			},
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'messages'
	});
};