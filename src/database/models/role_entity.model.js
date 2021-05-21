const { DataTypes } = require('sequelize');
module.exports = (client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('RoleEntity', {
		colour: {
			defaultValue: '7289DA',
			type: DataTypes.CHAR(6)
		},
		name: DataTypes.TEXT,
		role: {
			allowNull: false,
			type: DataTypes.CHAR(19),
			unique: 'role-ticket'
		},
		ticket: {
			allowNull: false,
			references: {
				key: 'id',
				model: DB_TABLE_PREFIX + 'tickets'
			},
			type: DataTypes.CHAR(19),
			unique: 'role-ticket'
		}
	}, { tableName: DB_TABLE_PREFIX + 'role_entities' });
};