const { DataTypes } = require('sequelize');
module.exports = (client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('ChannelEntity', {
		channel: {
			type: DataTypes.CHAR(19),
			allowNull: false,
			unique: 'id-ticket'
		},
		name: DataTypes.TEXT,
		ticket: {
			type: DataTypes.CHAR(19),
			allowNull: false,
			unique: 'id-ticket',
			references: {
				model: DB_TABLE_PREFIX + 'tickets',
				key: 'id'
			},
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'channel_entities'
	});
};