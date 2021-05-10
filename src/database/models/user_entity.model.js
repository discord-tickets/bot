const { DataTypes } = require('sequelize');
module.exports = (client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('UserEntity', {
		avatar: DataTypes.STRING,
		bot: DataTypes.BOOLEAN,
		discriminator: DataTypes.STRING,
		display_name: DataTypes.TEXT,
		ticket: {
			type: DataTypes.CHAR(19),
			allowNull: false,
			unique: 'user-ticket',
			references: {
				model: DB_TABLE_PREFIX + 'tickets',
				key: 'id'
			},
		},
		user: {
			type: DataTypes.CHAR(19),
			allowNull: false,
			unique: 'user-ticket'
		},
		username: DataTypes.TEXT,
		role: {
			type: DataTypes.CHAR(19),
			allowNull: false,
			references: {
				model: DB_TABLE_PREFIX + 'role_entities',
				key: 'role'
			},
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'user_entities'
	});
};