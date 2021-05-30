const { DataTypes } = require('sequelize');
module.exports = (client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('Survey', {
		guild: {
			allowNull: false,
			references: {
				key: 'id',
				model: DB_TABLE_PREFIX + 'guilds'
			},
			type: DataTypes.CHAR(19),
			unique: 'name-guild'
		},
		name: {
			allowNull: false,
			type: DataTypes.STRING,
			unique: 'name-guild'
		},
		questions: {
			allowNull: true,
			get() {
				const raw_value = this.getDataValue('questions');
				return raw_value
					? typeof raw_value === 'string'
						? JSON.parse(raw_value)
						: raw_value
					: null;
			},
			type: DataTypes.JSON
		}
	}, { tableName: DB_TABLE_PREFIX + 'surveys' });
};