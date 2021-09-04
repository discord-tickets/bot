const { DataTypes } = require('sequelize');
module.exports = ({ config }, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('Guild', {
		blacklist: {
			defaultValue: [],
			get() {
				const raw_value = this.getDataValue('blacklist');
				return raw_value
					? typeof raw_value === 'string'
						? JSON.parse(raw_value)
						: raw_value
					: null;
			},
			type: DataTypes.JSON
		},
		colour: {
			defaultValue: config.defaults.colour,
			type: DataTypes.STRING
		},
		command_prefix: {
			defaultValue: config.defaults.command_prefix,
			type: DataTypes.STRING
		},
		error_colour: {
			defaultValue: 'RED',
			type: DataTypes.STRING
		},
		autoclose: {
			defaultValue: 'false',
			type: DataTypes.BOOLEAN
		},
		footer: {
			defaultValue: 'Discord Tickets by eartharoid',
			type: DataTypes.STRING
		},
		id: {
			allowNull: false,
			primaryKey: true,
			type: DataTypes.CHAR(19)
		},
		locale: {
			defaultValue: config.locale,
			type: DataTypes.STRING
		},
		log_messages: {
			defaultValue: config.defaults.log_messages,
			type: DataTypes.BOOLEAN
		},
		success_colour: {
			defaultValue: 'GREEN',
			type: DataTypes.STRING
		},
		tags: {
			defaultValue: {},
			get() {
				const raw_value = this.getDataValue('tags');
				return raw_value
					? typeof raw_value === 'string'
						? JSON.parse(raw_value)
						: raw_value
					: null;
			},
			type: DataTypes.JSON
		}
	}, { tableName: DB_TABLE_PREFIX + 'guilds' });
};
