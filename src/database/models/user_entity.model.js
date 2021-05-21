const { DataTypes } = require('sequelize');
module.exports = (client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('UserEntity', {
		avatar: DataTypes.STRING,
		bot: DataTypes.BOOLEAN,
		discriminator: DataTypes.STRING,
		display_name: DataTypes.TEXT,
		role: {
			allowNull: false,
			references: {
				key: 'role',
				model: DB_TABLE_PREFIX + 'role_entities'
			},
			type: DataTypes.CHAR(19)
		},
		ticket: {
			allowNull: false,
			references: {
				key: 'id',
				model: DB_TABLE_PREFIX + 'tickets'
			},
			type: DataTypes.CHAR(19),
			unique: 'user-ticket'
		},
		user: {
			allowNull: false,
			type: DataTypes.CHAR(19),
			unique: 'user-ticket'
		},
		username: DataTypes.TEXT

	}, { tableName: DB_TABLE_PREFIX + 'user_entities' });
};