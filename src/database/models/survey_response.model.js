const { DataTypes } = require('sequelize');
module.exports = (client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('SurveyResponse', {
		answers: {
			allowNull: true,
			type: DataTypes.JSON
		},
		survey: {
			allowNull: false,
			references: {
				key: 'id',
				model: DB_TABLE_PREFIX + 'surveys'
			},
			type: DataTypes.INTEGER,
			unique: 'survey-ticket'
		},
		ticket: {
			allowNull: false,
			references: {
				key: 'id',
				model: DB_TABLE_PREFIX + 'tickets'
			},
			type: DataTypes.CHAR(19),
			unique: 'survey-ticket'
		}
	}, { tableName: DB_TABLE_PREFIX + 'survey_responses' });
};