const { DataTypes } = require('sequelize');
module.exports = (client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('Panel', {
		categories: {
			allowNull: false,
			get() {
				const raw_value = this.getDataValue('categories');
				return raw_value
					? typeof raw_value === 'string'
						? JSON.parse(raw_value)
						: raw_value
					: null;
			},
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