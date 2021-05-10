const { DataTypes } = require('sequelize');
module.exports = (client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('RoleEntity', {
		colour: {
			type: DataTypes.CHAR(6),
			defaultValue: '7289DA',
		},
		name: DataTypes.TEXT,
		role: {
			type: DataTypes.CHAR(19),
			allowNull: false,
			unique: 'role-ticket'
		},
		ticket: {
			type: DataTypes.CHAR(19),
			allowNull: false,
			unique: 'role-ticket',
			references: {
				model: DB_TABLE_PREFIX + 'tickets',
				key: 'id'
			},
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'role_entities'
	});
};