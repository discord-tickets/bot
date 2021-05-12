const { DataTypes } = require('sequelize');
module.exports = ({ config }, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('Category', {
		id: {
			type: DataTypes.CHAR(19),
			primaryKey: true,
			allowNull: false,
		},
		claiming: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		guild: {
			type: DataTypes.CHAR(19),
			allowNull: false,
			references: {
				model: DB_TABLE_PREFIX + 'guilds',
				key: 'id'
			},
			unique: 'name-guild'
		},
		image: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		max_per_member: {
			type: DataTypes.INTEGER,
			defaultValue: 1
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: 'name-guild'
		},
		name_format: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: config.defaults.name_format
		},
		opening_message: {
			type: DataTypes.STRING,
			defaultValue: config.defaults.opening_message,
		},
		opening_questions: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		ping: {
			type: DataTypes.JSON,
			defaultValue: [],
		},
		require_topic: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		roles: {
			type: DataTypes.JSON,
			allowNull: false,
		},
		survey: {
			type: DataTypes.STRING,
			allowNull: true,
		}
	}, {
		tableName: DB_TABLE_PREFIX + 'categories'
	});
};