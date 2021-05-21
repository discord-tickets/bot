const { DataTypes } = require('sequelize');
module.exports = (_client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('Message', {

		author: {
			allowNull: false,
			type: DataTypes.CHAR(19)
		},
		data: {
			allowNull: false,
			type: DataTypes.TEXT
		},
		deleted: {
			defaultValue: false,
			type: DataTypes.BOOLEAN
		},
		edited: {
			defaultValue: false,
			type: DataTypes.BOOLEAN
		},
		id: {
			allowNull: false,
			primaryKey: true,
			type: DataTypes.CHAR(19)
		},
		ticket: {
			allowNull: false,
			references: {
				key: 'id',
				model: DB_TABLE_PREFIX + 'tickets'
			},
			type: DataTypes.CHAR(19)
		}
	}, { tableName: DB_TABLE_PREFIX + 'messages' });
};