const { DataTypes } = require('sequelize');
module.exports = ({ config }, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('Category', {
		claiming: {
			defaultValue: false,
			type: DataTypes.BOOLEAN
		},
		guild: {
			allowNull: false,
			references: {
				key: 'id',
				model: DB_TABLE_PREFIX + 'guilds'
			},
			type: DataTypes.CHAR(19),
			unique: 'name-guild'
		},
		id: {
			allowNull: false,
			primaryKey: true,
			type: DataTypes.CHAR(19)
		},
		image: {
			allowNull: true,
			type: DataTypes.STRING
		},
		max_per_member: {
			defaultValue: 1,
			type: DataTypes.INTEGER
		},
		name: {
			allowNull: false,
			type: DataTypes.STRING,
			unique: 'name-guild'
		},
		name_format: {
			allowNull: false,
			defaultValue: config.defaults.name_format,
			type: DataTypes.STRING
		},
		opening_message: {
			defaultValue: config.defaults.opening_message,
			type: DataTypes.STRING
		},
		opening_questions: {
			allowNull: true,
			type: DataTypes.JSON
		},
		ping: {
			defaultValue: [],
			type: DataTypes.JSON
		},
		require_topic: {
			defaultValue: false,
			type: DataTypes.BOOLEAN
		},
		roles: {
			allowNull: false,
			type: DataTypes.JSON
		},
		survey: {
			allowNull: true,
			type: DataTypes.STRING
		}
	}, { tableName: DB_TABLE_PREFIX + 'categories' });
};