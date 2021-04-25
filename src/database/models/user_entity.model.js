const { DataTypes } = require('sequelize');
module.exports = (client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('UserEntity', {
		avatar: DataTypes.STRING,
		bot: DataTypes.BOOLEAN,
		colour: DataTypes.CHAR(6),
		discriminator: DataTypes.STRING,
		display_name: DataTypes.TEXT,
		ticket: {
			type: DataTypes.CHAR(19),
			allowNull: false,
			unique: 'id-ticket',
			references: {
				model: DB_TABLE_PREFIX + 'tickets',
				key: 'id'
			},
		},
		user: {
			type: DataTypes.CHAR(19),
			allowNull: false,
			unique: 'id-ticket'
		},
		username: DataTypes.TEXT,
	}, {
		tableName: DB_TABLE_PREFIX + 'user_entities'
	});
};