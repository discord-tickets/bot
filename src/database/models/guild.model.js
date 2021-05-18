const { DataTypes } = require('sequelize');
module.exports = ({ config }, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('Guild', {
		id: {
			type: DataTypes.CHAR(19),
			primaryKey: true,
			allowNull: false,
		},
		blacklist: {
			type: DataTypes.JSON,
			defaultValue: [],
		},
		colour: {
			type: DataTypes.STRING,
			defaultValue: config.defaults.colour
		},
		command_prefix: {
			type: DataTypes.STRING,
			defaultValue: config.defaults.command_prefix
		},
		error_colour: {
			type: DataTypes.STRING,
			defaultValue: 'RED'
		},
		footer: {
			type: DataTypes.STRING,
			defaultValue: 'Discord Tickets by eartharoid'
		},
		locale: {
			type: DataTypes.STRING,
			defaultValue: config.locale
		},
		log_messages: {
			type: DataTypes.BOOLEAN,
			defaultValue: config.defaults.log_messages
		},
		success_colour: {
			type: DataTypes.STRING,
			defaultValue: 'GREEN'
		},
		tags: {
			type: DataTypes.JSON,
			defaultValue: {}
		}
	}, {
		tableName: DB_TABLE_PREFIX + 'guilds'
	});
};