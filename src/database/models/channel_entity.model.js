const { DataTypes } = require('sequelize');
module.exports = (_client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('ChannelEntity', {
		channel: {
			allowNull: false,
			type: DataTypes.CHAR(19),
			unique: 'channel-ticket'
		},
		name: DataTypes.TEXT,
		ticket: {
			allowNull: false,
			references: {
				key: 'id',
				model: DB_TABLE_PREFIX + 'tickets'
			},
			type: DataTypes.CHAR(19),
			unique: 'channel-ticket'
		}
	}, { tableName: DB_TABLE_PREFIX + 'channel_entities' });
};