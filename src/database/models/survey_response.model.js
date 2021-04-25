const { DataTypes } = require('sequelize');
module.exports = (client, sequelize) => {
	const { DB_TABLE_PREFIX } = process.env;
	sequelize.define('SurveyResponse', {
		answers: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		survey: {
			type: DataTypes.INTEGER,
			allowNull: false,
			unique: 'survey-ticket',
			references: {
				model: DB_TABLE_PREFIX + 'surveys',
				key: 'id'
			},
		},
		ticket: {
			type: DataTypes.CHAR(19),
			allowNull: false,
			unique: 'survey-ticket',
			references: {
				model: DB_TABLE_PREFIX + 'tickets',
				key: 'id'
			},
		},
	}, {
		tableName: DB_TABLE_PREFIX + 'survey_responses'
	});
};