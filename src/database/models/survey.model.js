const { DataTypes } = require('sequelize');
module.exports = (client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('Survey', {
		guild: {
			type: DataTypes.CHAR(18),
			allowNull: false,
			references: {
				model: DB_TABLE_PREFIX + 'guilds',
				key: 'id'
			},
			unique: 'name-guild'
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: 'name-guild'
		},
		questions: {
			type: DataTypes.JSON,
			allowNull: true,
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'surveys'
	});
};