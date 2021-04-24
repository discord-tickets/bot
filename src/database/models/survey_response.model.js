const { DataTypes } = require('sequelize');
module.exports = (client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('SurveyResponse', {
		answers: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		survey: {
			type: DataTypes.CHAR(18),
			allowNull: false,
			references: {
				model: DB_TABLE_PREFIX + 'surveys',
				key: 'id'
			},
		},
		ticket: {
			type: DataTypes.CHAR(18),
			allowNull: false,
			unique: 'id-ticket',
			references: {
				model: DB_TABLE_PREFIX + 'tickets',
				key: 'id'
			},
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'survey_responses'
	});
};