const { DataTypes } = require('sequelize');
module.exports = (client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('Panel', {
		categories: {
			allowNull: false,
			type: DataTypes.JSON
		},
		channel: {
			allowNull: false,
			type: DataTypes.CHAR(19)
		},
		guild: {
			allowNull: false,
			references: {
				key: 'id',
				model: DB_TABLE_PREFIX + 'guilds'
			},
			type: DataTypes.CHAR(19)
		},
		message: {
			allowNull: false,
			type: DataTypes.CHAR(19)
		}
	}, { tableName: DB_TABLE_PREFIX + 'panels' });
};