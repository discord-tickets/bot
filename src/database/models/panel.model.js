const { DataTypes } = require('sequelize');
module.exports = (client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('Panel', {
		categories: {
			type: DataTypes.JSON,
			allowNull: false
		},
		guild: {
			type: DataTypes.CHAR(19),
			allowNull: false,
			references: {
				model: DB_TABLE_PREFIX + 'guilds',
				key: 'id'
			}
		},
		message: {
			type: DataTypes.CHAR(19),
			allowNull: false
		},
		reactionless: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
	}, {
		tableName: DB_TABLE_PREFIX + 'panels'
	});
};